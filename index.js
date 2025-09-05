import puppeteer from "puppeteer";
import nodemailer from "nodemailer";

const recipients = [
    "nnear@darasa.io",
    "mars@darasa.io"
];

// ======= Cấu hình gửi mail =======
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

// ======= Hàm màu cho console =======
const colorText = (text, inp) => {
    if (inp === "Lỗi hoặc chưa ghi nhận" || inp === "Chưa lấy được") return `\x1b[37m${text}\x1b[0m`; // trắng
    const num = parseInt(inp);
    if (num <= 200) return `\x1b[32m${text}\x1b[0m`; // xanh
    if (num <= 500) return `\x1b[33m${text}\x1b[0m`; // vàng
    return `\x1b[31m${text}\x1b[0m`; // đỏ
};
// ======= Gửi mail =======
async function sendMail(results) {
    const now = new Date();
    const dt = `${String(now.getDate()).padStart(2, '0')}/` +
        `${String(now.getMonth() + 1).padStart(2, '0')}/` +
        `${now.getFullYear()} ` +
        `${String(now.getHours()).padStart(2, '0')}:` +
        `${String(now.getMinutes()).padStart(2, '0')}:` +
        `${String(now.getSeconds()).padStart(2, '0')}`;

    let html = `<h3>Kết quả INP tuần này - ${dt}</h3>
    <table border='1' cellpadding='5' style="border-collapse: collapse;">
      <tr style="background:#ddd">
        <th>URL</th>
        <th>INP</th>
        <th>CrUX Link</th>
      </tr>`;

    results.forEach(r => {
        let color = "#000";
        if (r.inp !== "Lỗi hoặc chưa ghi nhận" && r.inp !== "Chưa lấy được") {
            const num = parseInt(r.inp);
            if (num <= 200) color = "green";
            else if (num <= 500) color = "orange";
            else color = "red";
        }

        // Tạo link CrUX
        const cruxLink = `https://cruxvis.withgoogle.com/#/?view=interactivity&url=${encodeURIComponent(r.url)}&identifier=url`;

        html += `<tr>
            <td>${r.url}</td>
            <td style="color:${color}">${r.inp}</td>
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
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    let results = [];

    console.log(`🎉 Bắt đầu check ${urls.length} URL...\n`);

    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const page = await browser.newPage();
        try {
            console.log(`🚀 [${i + 1}/${urls.length}] Bắt đầu check: ${url}`);

            const target = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}`;
            console.log(`🌐 Mở PageSpeed URL: ${target}`);

            await page.goto(target, { waitUntil: "networkidle2", timeout: 0 });

            console.log("⏳ Đang chờ INP hiển thị...");

            await page.waitForFunction(() => {
                return Array.from(document.querySelectorAll("span")).some(
                    s =>
                        s.innerText.includes("ms") &&
                        s.closest("div")?.innerText.includes("Interaction to Next Paint")
                );
            }, { timeout: 30_000 }); // 30 giây

            const inp = await page.evaluate(() => {
                const node = Array.from(document.querySelectorAll("span"))
                    .find(
                        s =>
                            s.innerText.includes("ms") &&
                            s.closest("div")?.innerText.includes("Interaction to Next Paint")
                    );
                if (!node) return null;
                const match = node.innerText.match(/(\d+)\s*ms/);
                return match ? match[0] : null;
            });

            results.push({ url, inp: inp || "Chưa lấy được" });
            console.log(`✅ [${i + 1}/${urls.length}] Lấy INP xong`);
        } catch (err) {
            console.error(`❌ Lỗi khi check ${url}:`, err.message);
            results.push({ url, inp: "Lỗi hoặc chưa ghi nhận" });
        } finally {
            await page.close();
        }
    }

    await browser.close();

    // ===== sort lỗi xuống dưới =====
    results.sort((a, b) => {
        if (a.inp === "Lỗi hoặc chưa ghi nhận" || a.inp === "Chưa lấy được") return 1;
        if (b.inp === "Lỗi hoặc chưa ghi nhận" || b.inp === "Chưa lấy được") return -1;
        return parseInt(a.inp) - parseInt(b.inp);
    });

    console.log("\n🎉 Kết quả INP:");
    console.table(results.map(r => ({
        URL: r.url,
        INP: colorText(r.inp, r.inp)
    })));

    // Gửi mail
    await sendMail(results);
}

// ======= Danh sách URL =======
const urls = [
    "https://sut88.com/",
    "https://lu88.com/",
    "https://zo88.com/",
    "https://gem88.vip/",
    "https://pub88.com/",
    "https://dv88.com/",
    "https://hbet.net/",
    "https://888bet.net/",
    "https://soi.bet/",
];

// Chạy
runCheckInp(urls);
