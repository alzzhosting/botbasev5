import fs from "fs";

const pkg = JSON.parse(fs.readFileSync("package.json"));
console.log(pkg);

global.bot = {
    name: "BotBase Kenz V5",
    number: "6288215523477",
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
    number: "6288215523477",
};

global.db = {
  user: [],
  premium: [],
  group: [],
  save: async function(dbName) {
    
  }
}
