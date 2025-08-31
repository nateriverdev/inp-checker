import puppeteer from "puppeteer";
import nodemailer from "nodemailer";

// ======= Cấu hình gửi mail =======
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "your.email@gmail.com",        // thay bằng email của bạn
        pass: "your_app_password_here",      // dùng App Password nếu Gmail
    },
});

async function sendMail(results) {
    let html = `<h3>Kết quả INP tuần này</h3>
    <table border='1' cellpadding='5'>
      <tr>
        <th>URL</th>
        <th>INP</th>
      </tr>`;
    results.forEach(r => {
        html += `<tr><td>${r.url}</td><td>${r.inp}</td></tr>`;
    });
    html += `</table>`;

    await transporter.sendMail({
        from: '"INP Checker" <your.email@gmail.com>',
        to: "recipient1@gmail.com, recipient2@gmail.com",  // danh sách nhận
        subject: "Báo cáo INP tuần",
        html,
    });

    console.log("📧 Mail đã gửi thành công!");
}

// ======= Puppeteer check INP =======
async function runCheckInp(urls) {
    const browser = await puppeteer.launch({ headless: true });
    const results = [];

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
            }, { timeout: 90_000 });

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

    console.log("\n🎉 Kết quả INP:");
    console.table(results);

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
    "https://888bet.net/",
    "https://dv88.com/"
];

// Chạy
runCheckInp(urls);
