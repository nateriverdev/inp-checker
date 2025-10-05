import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import nodemailer from "nodemailer";
import fetch from "node-fetch";

const recipients = [
    "nnear@darasa.io",
    "mars@darasa.io"
];

const RESULT_FILE = path.join(process.cwd(), "inp-results.json");

// ======= Cấu hình gửi mail =======
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ======= Hàm màu cho console =======
const colorText = (text, inp) => {
    if (inp === "Lỗi hoặc chưa ghi nhận" || inp === "Chưa lấy được")
        return `\x1b[37m${text}\x1b[0m`; // trắng
    const num = parseInt(inp);
    if (num <= 200) return `\x1b[32m${text}\x1b[0m`; // xanh
    if (num <= 500) return `\x1b[33m${text}\x1b[0m`; // vàng
    return `\x1b[31m${text}\x1b[0m`; // đỏ
};

// ======= Hàm màu cho Delta =======
const colorDelta = (delta, isText = false) => {
    if (isText) {
        return delta === 'Yes' ? `\x1b[32m${delta}ms\x1b[0m` : `\x1b[31m+${delta}ms\x1b[0m`
    }
    if (delta === undefined) return "-";
    if (delta > 0) return `\x1b[31m+${delta}ms\x1b[0m`; // đỏ nếu tăng
    if (delta < 0) return `\x1b[32m${delta}ms\x1b[0m`; // xanh nếu giảm
    return `${delta}ms`;
};

// ======= Gửi mail =======
async function sendMail(results) {
    const now = new Date();
    const dt =
        `${String(now.getDate()).padStart(2, "0")}/` +
        `${String(now.getMonth() + 1).padStart(2, "0")}/` +
        `${now.getFullYear()} ` +
        `${String(now.getHours()).padStart(2, "0")}:` +
        `${String(now.getMinutes()).padStart(2, "0")}:` +
        `${String(now.getSeconds()).padStart(2, "0")}`;

    let html = `<h3>Kết quả INP tuần này - ${dt}</h3>
    <table border='1' cellpadding='5' style="border-collapse: collapse;">
      <tr style="background:#ddd">
        <th>URL</th>
        <th>INP</th>
        <th>Delta</th>
        <th>Welcome Popup</th>
        <th>CrUX Link</th>
      </tr>`;

    results.forEach((r) => {
        let color = "#000";
        if (typeof r.inp === "number") {
            if (r.inp <= 200) color = "green";
            else if (r.inp <= 500) color = "orange";
            else color = "red";
        }

        let deltaText = "-";
        let deltaColor = "#000";
        if (r.delta !== undefined) {
            if (r.delta > 0) {
                deltaText = `+${r.delta}ms`;
                deltaColor = "red";
            } else if (r.delta < 0) {
                deltaText = `${r.delta}ms`;
                deltaColor = "green";
            } else {
                deltaText = "0ms";
            }
        }

        const cruxLink = `https://cruxvis.withgoogle.com/#/?view=interactivity&url=${encodeURIComponent(
            r.url
        )}&identifier=url`;

        html += `<tr>
            <td>${r.url}</td>
            <td style="color:${color}">${typeof r.inp === "number" ? r.inp + "ms" : r.inp}</td>
            <td style="color:${deltaColor}">${deltaText}</td>
            <td>${r.welcomePopup}</td>
            <td><a href="${cruxLink}" target="_blank">Xem CrUX</a></td>
        </tr>`;
    });
    html += `</table>`;

    await transporter.sendMail({
        from: '"INP Checker" <nnear@darasa.io>',
        to: recipients.join(", "),
        subject: `📊 Báo cáo INP tuần - ${dt}`,
        html,
    });

    console.log("📧 Mail đã gửi thành công!");
}

// ======= Puppeteer check INP =======
async function runCheckInp(urls) {
    // Load kết quả cũ
    let oldResults = {};
    if (fs.existsSync(RESULT_FILE)) {
        try {
            oldResults = JSON.parse(fs.readFileSync(RESULT_FILE, "utf-8"));
        } catch { }
    }

    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    let results = [];

    console.log(`🎉 Bắt đầu check ${urls.length} URL...\n`);

    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const page = await browser.newPage();
        try {
            console.log(`🚀 [${i + 1}/${urls.length}] Bắt đầu check: ${url}`);

            const target = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(
                url
            )}`;
            await page.goto(target, { waitUntil: "networkidle2", timeout: 0 });

            await page.waitForFunction(
                () => {
                    return Array.from(document.querySelectorAll("span")).some(
                        (s) =>
                            s.innerText.includes("ms") &&
                            s
                                .closest("div")
                                ?.innerText.includes("Interaction to Next Paint")
                    );
                },
                { timeout: 30_000 * 2 }
            );

            const inp = await page.evaluate(() => {
                const node = Array.from(document.querySelectorAll("span")).find(
                    (s) =>
                        s.innerText.includes("ms") &&
                        s
                            .closest("div")
                            ?.innerText.includes("Interaction to Next Paint")
                );
                if (!node) return null;
                const match = node.innerText.match(/(\d+)\s*ms/);
                return match ? parseInt(match[1]) : null;
            });

            let inpValue = inp || "Chưa lấy được";
            let delta;
            if (
                typeof inpValue === "number" &&
                oldResults[url] &&
                typeof oldResults[url] === "number"
            ) {
                delta = inpValue - oldResults[url];
            }

            // ==== Check Welcome Popup ====
            let welcomePopup = "No";
            try {
                const domain = new URL(url).origin;
                const apiUrl = `${domain}/gw/api/v2/common`;
                const resp = await fetch(apiUrl, { timeout: 10000 });
                if (resp.ok) {
                    const json = await resp.json();
                    if (json?.data?.welcomePopup?.data) {
                        welcomePopup = "Yes";
                    }
                }
            } catch (e) {
                console.warn(`⚠️ Không check được Welcome Popup cho ${url}`);
            }

            results.push({ url, inp: inpValue, delta, welcomePopup });
            console.log(`✅ [${i + 1}/${urls.length}] Lấy INP xong -> `, inpValue);
        } catch (err) {
            console.error(`❌ Lỗi khi check ${url}:`, err.message);
            results.push({ url, inp: "Lỗi hoặc chưa ghi nhận", welcomePopup: "No" });
        } finally {
            await page.close();
        }
    }

    await browser.close();

    // ===== sort lỗi xuống dưới =====
    results.sort((a, b) => {
        if (typeof a.inp !== "number") return 1;
        if (typeof b.inp !== "number") return -1;
        return a.inp - b.inp;
    });

    console.log("\n🎉 Kết quả INP:");
    console.table(
        results.map((r) => ({
            URL: r.url,
            INP: typeof r.inp === "number" ? colorText(`${r.inp}ms`, r.inp) : r.inp,
            Delta: r.delta !== undefined ? colorDelta(r.delta) : "-",
            "Welcome Popup": colorDelta(r.welcomePopup, true),
        }))
    );

    // Gửi mail
    await sendMail(results);

    // Lưu kết quả mới để lần sau so sánh
    const saveObj = {};
    results.forEach((r) => {
        if (typeof r.inp === "number") {
            saveObj[r.url] = r.inp;
        }
    });
    fs.writeFileSync(RESULT_FILE, JSON.stringify(saveObj, null, 2), "utf-8");
}

// ======= Danh sách URL =======
const urls = [
    "https://sut88.vip/",
    "https://lu88.com/",
    "https://gem88.com/",
    "https://pub88.com/",
    "https://dv88.com/",
    "https://hbet.net/",
    "https://zo88.vip/",
    "https://888bet.net/",
    "https://soi.bet/",
];

// Chạy
runCheckInp(urls);
