
import axios from 'axios';
import nodemailer from "nodemailer";

const recipients = [
    "nnear@darasa.io",
];

const modelName = {
    "IP_17_PRO": 'MG864AH/A',
    "IP_17_PRO_MAX": 'MFY84AH/A',
    'IP_AIR': 'MG1A4AH/A'
}

const URL = [
    `https://www.apple.com/ae/shop/fulfillment-messages?fae=true&pl=true&mts.0=regular&mts.1=compact&parts.0=${modelName.IP_17_PRO_MAX}&location=Dubai`,
    `https://www.apple.com/ae/shop/fulfillment-messages?fae=true&pl=true&mts.0=regular&mts.1=compact&parts.0=${modelName.IP_17_PRO}&location=Dubai`
];

const INIT_URL = `https://www.apple.com/ae/shop/sba/d/init?fnode=25f3edcb18d1d985c975cd959072451e3bc514bf504a571975d2adbdd703fcae54cb76ec91bfaf711b7b9130e21be82488ad536358d03d635f2e355117033a90d7835b5384a0b34f5be25e53994e0fda4e2607d2bcbd3696132efc4ea31e774ecc26a0a72bd64e0e48fdeb0d3d7d2304&product=MFY84AH%2FA`;
const COOKIE_URL = `https://www.apple.com/shop/shld/work/v1/q?wd=0`;

const options = {
    headers: {
        "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
    }
}
// "finy mxpc baii vhqz"
// ======= Cấu hình gửi mail =======
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        // user: process.env.EMAIL_USER,
        // pass: process.env.EMAIL_PASS,
        user: 'nnear@darasa.io',
        pass: "finy mxpc baii vhqz",
    },
});

// ======= Gửi mail =======
async function sendMail(results, totalAvailables) {
    const now = new Date();
    const dt =
        `${String(now.getDate()).padStart(2, "0")}/` +
        `${String(now.getMonth() + 1).padStart(2, "0")}/` +
        `${now.getFullYear()} ` +
        `${String(now.getHours()).padStart(2, "0")}:` +
        `${String(now.getMinutes()).padStart(2, "0")}:` +
        `${String(now.getSeconds()).padStart(2, "0")}`;

    let html = `<h3>Kết quả IP tuần này - ${dt}</h3>
    <table border='1' cellpadding='5' style="border-collapse: collapse;">
      <tr style="background:#ddd">
        <th>Trạng thái</th>
        <th>Sản phẩm</th>
        <th>Địa chỉ</th>
      </tr>`;
    let subject = `${totalAvailables}📱 __ `;
    results.forEach((r) => {
        const match = r.match(/(✅|❌)\s(.+?)\s-\s(.+)/);
        if (!match) return;

        const [, status, product, address] = match;

        if (status.includes('✅')) {
            subject += `✅${product} - ${address}`
        }

        html += `<tr>
            <td style="text-align:center">${status}</td>
            <td>${product}</td>
            <td>${address}</td>
        </tr>`;
    });


    html += `</table>`;

    await transporter.sendMail({
        from: '"IP Checker" <nnear@darasa.io>',
        to: recipients.join(", "),
        subject,
        html,
    });

    console.log("📧 Mail đã gửi thành công!");
}
const cookieHeader = (setCookieArray) =>
    setCookieArray.map(str => str.split(';')[0]) // lấy phần "name=value" đầu tiên
        .filter(str => str.includes('=')) // bỏ rác nếu có
        .join('; ');
// ======= Lấy cookie =======
const initApple = async () => {
    const response1 = await axios.get(INIT_URL, options);
    const response2 = await axios.post(COOKIE_URL, { wd: 0 }, options);
    const cookies1 = response1.headers['set-cookie'].filter(item => !item.includes('shld_bt_ck=;'));
    const cookies2 = response2.headers['set-cookie'].filter(item => !item.includes('shld_bt_ck=;'));
    console.log('cookies2:', cookies2)
    // return cookieHeader([...cookies1, ...cookies2]);
    return `dssid2=524d8446-9db3-4b15-a086-302d2b73db34; dssf=1; as_pcts=qUH0M5rI7uSR7rDEEynlAJo6:esb6N9grxwHc6QPzaA_ry1rXA2_TS-egCzQ1IOkzqNiSLof:+gECUqhXW9gBVK:1TcTaKnTBgDbMEg+2F+dW:pPIuFg0QXR47izXMeeztHNL; as_sfa=MnxhZXxhZXx8ZW5fQUV8Y29uc3VtZXJ8aW50ZXJuZXR8MHwwfDE; geo=SG; s_cc=true; as_rumid=d0a76cbd-33c8-41e9-a0ba-3b1dad20c6e6; as_dc=ucp5; s_fid=2A65E3D41BBE6AA3-288903480C59882C; s_vi=[CS]v1|34716FE95EE4A39E-600009FCE75B7D72[CE]; sh_spksy=.; shld_bt_ck=qxBzSJDPh7CxTDKbL74yMw|1759706100|iNLrt6KFtwSRz4nrWIWsoKTyBlRfWxhKhI6kEaqr8O1G0EgdOd1kg4lwrw9_gpJxGjyQrHrUDtUX2px2LYAOwAM-D9lpk0thKOaRxCPLh9sGBMYB6oYlR6e-WuaYDlWmwNZy4Wo7FODLecZX9HNZMoFxo6vQfM_2K_yOLmJYGppgjlOImZpj6FISGVa8kL8wLNxnhO-ymNFSkwL7ceT5deSikIuHtx4bQBqcUYZJwkFZ7dFpz1Ls0c5s_F6GLdMioeH_yhzwXf0Xulj_9o8bE6Ck3Zk3OwZ6vBFRLUMqOJuu6elHvm4qLdO2JxKVZr5Rp9S7jmsNE9iMKPKKGaHCVw|WV33ZhrMwoB8TDcgdIFm-IqeA4o; shld_bt_m=jrPpeTtrvEP7IF0N5n-TlA|1759706143|aitJO44-FAMB9tCJlYNHbA|MUW0mlJxsf9e6PIGacjfHQTi9zI; as_atb=1.0|MjAyNS0xMC0wNSAwMjoxNTo0Mw|f4547f7e04fe97fc7192be5146652edfd56061f5`;
}

// ======= Format kết quả =======
const formatResults = (response) => {
    const stores = response?.data?.body?.content?.PickupMessage?.stores || response?.data?.body?.content?.pickupMessage?.stores;
    const partsAvailability = stores.map(store => {
        const itemsAvailability = store?.partsAvailability?.[modelName.IP_17_PRO_MAX] || store?.partsAvailability?.[modelName.IP_17_PRO] || store?.partsAvailability?.[modelName.IP_AIR];
        if (itemsAvailability) {
            const item = itemsAvailability?.messageTypes?.regular?.storePickupProductTitle || itemsAvailability?.messageTypes?.compact?.storePickupProductTitle;
            const address = itemsAvailability?.messageTypes?.regular?.storePickupQuote || itemsAvailability?.messageTypes?.compact?.storePickupQuote;

            if (item && address) {
                if (address.includes('unavailable')) {
                    return `❌ ${item} - UNAVAILABLE`
                }
                return `✅ ${item} - ${address}`
            }

            return null
        };

        return null;
    }).filter(Boolean);

    return partsAvailability;
}

// ======= Main =======
async function main() {
    try {
        const cookie = await initApple();

        const responses = await Promise.all(
            URL.map(url => axios.get(url, { headers: { cookie, ...options.headers } }))
        );

        // Gộp tất cả kết quả
        const allResults = responses.flatMap(formatResults);

        // Gửi mail
        console.log('allResults:', allResults)
        const totalAvailables = allResults.filter(item => !item.includes('UNAVAILABLE'))?.length;
        console.log('totalAvailables:', totalAvailables)
        if (!allResults.includes('UNAVAILABLE'))
            await sendMail(allResults, totalAvailables);

    } catch (error) {
        console.log('network error -> ', error?.status || error.message);
        return;
    }
}

main();
