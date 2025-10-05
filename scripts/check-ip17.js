// import axios from 'axios';
// import nodemailer from "nodemailer";

// const recipients = [
//     "nnear@darasa.io",
// ];


// const modelName = {
//     "IP_17_PRO": 'MG864AH/A',
//     "IP_17_PRO_MAX": 'MFY84AH/A',
//     'IP_AIR': 'MG1A4AH/A'
// }
// const model = modelName.IP_17_PRO_MAX;
// const URL = [`https://www.apple.com/ae/shop/fulfillment-messages?fae=true&pl=true&mts.0=regular&mts.1=compact&parts.0=${modelName.IP_17_PRO_MAX}&location=Dubai`, `https://www.apple.com/ae/shop/fulfillment-messages?fae=true&pl=true&mts.0=regular&mts.1=compact&parts.0=${modelName.IP_17_PRO}&location=Dubai`]
// const INIT_URL = `https://www.apple.com/ae/shop/sba/d/init?fnode=25f3edcb18d1d985c975cd959072451e3bc514bf504a571975d2adbdd703fcae54cb76ec91bfaf711b7b9130e21be82488ad536358d03d635f2e355117033a90d7835b5384a0b34f5be25e53994e0fda4e2607d2bcbd3696132efc4ea31e774ecc26a0a72bd64e0e48fdeb0d3d7d2304&product=MFY84AH%2FA`
// const COOKIE_URL = `https://www.apple.com/shop/shld/work/v1/q?wd=0`;

// const options = {
//     headers: {
//         "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
//     }
// }

// // ======= Cấu hình gửi mail =======
// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true,
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });
// // ======= Gửi mail =======
// async function sendMail(results) {
//     const now = new Date();
//     const dt =
//         `${String(now.getDate()).padStart(2, "0")}/` +
//         `${String(now.getMonth() + 1).padStart(2, "0")}/` +
//         `${now.getFullYear()} ` +
//         `${String(now.getHours()).padStart(2, "0")}:` +
//         `${String(now.getMinutes()).padStart(2, "0")}:` +
//         `${String(now.getSeconds()).padStart(2, "0")}`;

//     let html = `<h3>Kết quả IP tuần này - ${dt}</h3>
//     <table border='1' cellpadding='5' style="border-collapse: collapse;">
//       <tr style="background:#ddd">
//         <th>Trạng thái</th>
//         <th>Sản phẩm</th>
//         <th>Địa chỉ</th>
//       </tr>`;

//     results.forEach((r) => {
//         // tách trạng thái, tên, địa chỉ từ chuỗi
//         // ví dụ: '✅ iPhone 17 Pro 256GB Cosmic Orange - Today at Apple Al Jimi Mall'
//         const match = r.match(/(✅|❌)\s(.+?)\s-\s(.+)/);
//         if (!match) return;

//         const [, status, product, address] = match;

//         html += `<tr>
//             <td style="text-align:center">${status}</td>
//             <td>${product}</td>
//             <td>${address}</td>
//         </tr>`;
//     });

//     html += `</table>`;

//     await transporter.sendMail({
//         from: '"IP Checker" <nnear@darasa.io>',
//         to: recipients.join(", "),
//         subject: `📊 Báo cáo IP tuần - ${dt}`,
//         html,
//     });

//     console.log("📧 Mail đã gửi thành công!");
// }



// const cookieHeader = (setCookieArray) =>
//     setCookieArray.map(str => str.split(';')[0]) // lấy phần "name=value" đầu tiên
//         .filter(str => str.includes('=')) // bỏ rác nếu có
//         .join('; ');


// const initApple = async () => {
//     const response1 = await axios.get(INIT_URL, options);
//     const response2 = await axios.post(COOKIE_URL, {
//         wd: 0
//     }, options);
//     const cookies1 = response1.headers['set-cookie'].filter(item => !item.includes('shld_bt_ck=;'));
//     const cookies2 = response2.headers['set-cookie'].filter(item => !item.includes('shld_bt_ck=;'));
//     console.log('cookies2:', cookies2)
//     // return cookieHeader([...cookies1, ...cookies2]);
//     return `dssf=1; dssid2=95f92c2e-d30f-410c-bedc-48a196ca6880; as_pcts=hMWTGNaNl_Yrd+Gi-RWOQXAqg0GThziyLOm2pjMfZUDHwvVF4FkgjszKZj8Ebxg8hEeH7_KFjmLSLWDS18IEbemvPd:zA8eVReuL8ZncOpOP67OQll1rQzSSpY4pSmhrFpWf+; shld_bt_ck=x1aONxbhS21o3OuGfg5iQA|1759678652|NNGtNho4SHVjud21JIu0geUPtmXn69UPRBopVPC2bpTIOBvYJu2V9iGZiLbnXPIjBBmPj-wBfG-PSJwc8pIoqcxvQ8V028tIZxp53Qc6F-75ucaG5pByGWQLOBIkRI4v4zmOayT4eXeVYzNsoI7AAg_99-4PAxe-NSyXX81y5tbasE0BbLik0ic7iVfS_f9GlEo_b-QnP9pDFbUe8RGdH53R0Bm7KubN8L_6e8YVLhz54evCbJXABVviPGhZW6G8WfgB78nJznw9dzljUt6CyPPytI9gLMKULMQ3UeJ8gVgpEzzLdm83bXQt5PgB4foZExTA4_X8u0ZRQfLmlYT1XA|fU6kDmwrDW2j423Mv6idaF5rgXE;`;
// }
// // as_pcts
// // dssid2
// // shld_bt_ck

// const formatResults = (response) => {
//     const stores = response?.data?.body?.content?.PickupMessage?.stores || response?.data?.body?.content?.pickupMessage?.stores;
//     const partsAvailability = stores.map(store => {
//         const itemsAvailability = store?.partsAvailability?.[modelName.IP_17_PRO_MAX] || store?.partsAvailability?.[modelName.IP_17_PRO] || store?.partsAvailability?.[modelName.IP_AIR];
//         if (itemsAvailability) {
//             const item = itemsAvailability?.messageTypes?.regular?.storePickupProductTitle || itemsAvailability?.messageTypes?.compact?.storePickupProductTitle;
//             const address = itemsAvailability?.messageTypes?.regular?.storePickupQuote || itemsAvailability?.messageTypes?.compact?.storePickupQuote;

//             if (item && address) {
//                 if (address.includes('unavailable')) {
//                     return `❌ ${item} - UNAVAILABLE`
//                 }
//                 return `✅ ${item} - ${address}`
//             }

//             return null
//         };

//         return null;
//     }).filter(Boolean);
//     console.log('partsAvailability:', partsAvailability)
//     return partsAvailability;
// }

// async function main() {
//     try {


//         const cookie = await initApple();
//         const [respProMax, respPro] = await Promise.all(
//             URL.map(url => axios.get(url, {
//                 headers: {
//                     cookie,
//                     ...options.headers
//                 }
//             }))
//         );
//         formatResults(respProMax);
//         formatResults(respPro);

//         await transporter.sendMail({
//             from: '"IP Checker" <nnear@darasa.io>',
//             to: recipients.join(", "),
//             subject: `CHECK IP`,
//             html,
//         });
//     } catch (error) {
//         // console.log('error:', error)
//         console.log('network error -> ', error?.status);
//         return;
//     }
// }

// main();

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

// ======= Lấy cookie =======
const initApple = async () => {
    const response1 = await axios.get(INIT_URL, options);
    const response2 = await axios.post(COOKIE_URL, { wd: 0 }, options);
    const cookies1 = response1.headers['set-cookie'].filter(item => !item.includes('shld_bt_ck=;'));
    const cookies2 = response2.headers['set-cookie'].filter(item => !item.includes('shld_bt_ck=;'));
    // console.log('cookies2:', cookies2)
    // return cookieHeader([...cookies1, ...cookies2]);
    return `dssf=1; dssid2=95f92c2e-d30f-410c-bedc-48a196ca6880; as_pcts=hMWTGNaNl_Yrd+Gi-RWOQXAqg0GThziyLOm2pjMfZUDHwvVF4FkgjszKZj8Ebxg8hEeH7_KFjmLSLWDS18IEbemvPd:zA8eVReuL8ZncOpOP67OQll1rQzSSpY4pSmhrFpWf+; shld_bt_ck=x1aONxbhS21o3OuGfg5iQA|1759678652|NNGtNho4SHVjud21JIu0geUPtmXn69UPRBopVPC2bpTIOBvYJu2V9iGZiLbnXPIjBBmPj-wBfG-PSJwc8pIoqcxvQ8V028tIZxp53Qc6F-75ucaG5pByGWQLOBIkRI4v4zmOayT4eXeVYzNsoI7AAg_99-4PAxe-NSyXX81y5tbasE0BbLik0ic7iVfS_f9GlEo_b-QnP9pDFbUe8RGdH53R0Bm7KubN8L_6e8YVLhz54evCbJXABVviPGhZW6G8WfgB78nJznw9dzljUt6CyPPytI9gLMKULMQ3UeJ8gVgpEzzLdm83bXQt5PgB4foZExTA4_X8u0ZRQfLmlYT1XA|fU6kDmwrDW2j423Mv6idaF5rgXE;`;
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
