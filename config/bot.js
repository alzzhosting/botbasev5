/**
 *
 * SCRIPR BASE CREATE BY KENZ
 * ! NOT DELETE CREDIT,KALO RECODE BOLEH
 *
 * CREDIT :
 * > KENZ [ DEVELOPER ]
 * > RAZOR [ PENGEMBANG ]
 * > NADZ [ IDE ]
 *
 * RECODE :
 * > NAMA LU
 * > NAMA LU
 *
 */

import fs from "fs";

const pkg = JSON.parse(fs.readFileSync("package.json"));

global.bot = {
    name: "BotBase Kenz V5",
    number: "6285934686607",
    version: pkg["version"],
    prefix: ".",
    splitArgs: "|",
    locale: "id",
    timezone: "Asia/Jakarta",
    adsUrl: "https://youtube.com/@KenzzDev",
    newsletterJid: "", // id ch
    commands: (() => {
        return [];
    })(),
    setting: JSON.parse(fs.readFileSync("./config/setting.json")),
    saveSetting: function () {
        fs.writeFileSync(
            "./config/setting.json",
            JSON.stringify(global.bot.setting)
        );
        return global.bot.setting;
    }
};

global.owner = {
    name: "Kenz Shop Digital",
    number: "6288215523477"
};

global.image = {
    menu: "https://kenz.cloudx.biz.id/download/1744460856467.PNG",
    reply: "https://kenz.cloudx.biz.id/download/1744460856467.PNG"
};

global.mess = {
  owner: "*< ! > MAAF ANDA BUKAN OWNER BOT*"
}

global.db = {
    user: [],
    premium: [],
    group: [],
    save: async function (dbName) {}
};
