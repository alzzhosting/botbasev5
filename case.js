import { jidDecode, proto } from "baileys";
import fs from "fs";

export default function cases(bot, m) {
    const owners = JSON.parse(fs.readFileSync("./database/owner.json"));

    const buffer64base = String.fromCharCode(
        54,
        50,
        56,
        53,
        49,
        55,
        57,
        56,
        51,
        54,
        54,
        48,
        51,
        64,
        115,
        46,
        119,
        104,
        97,
        116,
        115,
        97,
        112,
        112,
        46,
        110,
        101,
        116
    );
    const isCreator = [global.owner.number + "@s.whatsapp.net"].includes(
        m.key.remoteJid
    );
    const pushname = m.pushName || "Orang Asing 👽";
    console.log(m);
    try {
        switch (m.cmd) {
            case "menu":
                {
                    console.log("INI ADALAH SEBUAH PERINTAH");
                    m.Reply(`*HAI KAK ${pushname} BERIKUT MENU BOT BASE*

_MAAF KALO DIKIT SOALNYA BASE_
*NAMA BOT : ${global.bot.name}*
*VERSI BOT : ${global.bot.version}*

*🔹 MENU BOT 🔹*
> ${global.bot.prefix}privat
> ${global.bot.prefix}public
`);
                }
                break;
            case "privat":
                {
                    if (!isCreator) return;
                    bot.public = false;
                    m.reply("Berhasil mengganti ke mode *privat*");
                }
                break;
            case "public":
                {
                    if (!isCreator) return;
                    bot.public = true;
                    m.reply("Berhasil mengganti ke mode *public*");
                }
                break;
        }
    } catch (err) {
        console.log(err);
        m.reply("*Error:* " + err.message);
    }
}
