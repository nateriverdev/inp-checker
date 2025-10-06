
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
    return `as_sfa=MnxhZXxhZXx8ZW5fQUV8Y29uc3VtZXJ8aW50ZXJuZXR8MHwwfDE; geo=SG; s_cc=true; dssf=1; as_rumid=b78230a8-2d50-46dc-bd7b-a54fed206ff3; dssid2=5464032e-65e8-4211-9da5-c474391d7047; s_fid=029C86B9CA6886F8-2636A20C943735F4; as_pcts=_1GejIrEH+Z0m2ailLe11Ua3o5I7u3Erc4lAVov+0nWYpi7uugZqD:3ewLqVhJIW2uBI_1i6H9kaHlsZez5b0nxLdrmassUG5SKvTZJnz4FS:OqfMJV0MPS7NO2AuNyjncKQK; as_dc=ucp5; as_uct=0; s_vi=[CS]v1|3471A33A968513B6-40000D6B81BE44AF[CE]; sh_spksy=.; shld_bt_ck=Lv-Hd-goX7IPq6ShAkL8zg|1759732420|QkdPmOgaLAdN4AAzMcA968IhVMlQ8EVhTUsGysR-0MAHRjvDBP9YtVJi1r0SzRGjw-CDzWyJSR764dga8bdbSIS1ojoStvbTGIo6Xs7ExdGUrw8zNfFvd-ha-zdAb2QbnVLIGLFBZnYvg8AyT7e4giLbMyQBVrRGVCskdrcu2rAJSdFc8HV5tA9O2ZyYfbCmiR9trAvjEf0IizkgWYfrj9_hcc-yqkqV8TquVPCjYjBNLRQYovK7YQFVP-svlN-yWO4yEKyEXiMFgo8fpm0V1nSeVt8-3ynnRKfnXyjKEnnPXcuMS-9GqucY6d0FldqrR6ViYJ0v1Dv-M0J3Qu8qYg|k1wv9R_Dlr8NO5s3WZAKWL2RAOU; as_atb=1.0|MjAyNS0xMC0wNSAwOTozMzo0MQ|bc5af48ae79d27192313bc1c6e725ebe5e0a7e57; shld_bt_m=4swrTpshV060fiStvYwpdg|1759732424|k0S7DkAfvBbMqRazB-sfKw|vrFMGczqX88izomYGWFfzMDq7Uw; s_sq=%5B%5BB%5D%5D`
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
