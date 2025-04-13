import {
    jidDecode,
    BufferJSON,
    WA_DEFAULT_EPHEMERAL,
    generateWAMessageFromContent,
    getBinaryNodeChildren,
    useMultiFileAuthState,
    generateWAMessageContent,
    downloadContentFromMessage,
    generateWAMessage,
    prepareWAMessageMedia,
    areJidsSameUser,
    getContentType
} from "@whiskeysockets/baileys";
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
    const args = m.body.trim().split(/ +/).slice(1);
    const text = args.join(" ");
    const isOwner = jidDecode(m.chatId).user === global.owner.number;
    const pushname = m.pushName || "Orang Asing 👽";
    console.log(m);

    try {
        switch (m.cmd) {
            case "menu":
                {
                    console.log("MENU BOT AKTIF");

                    m.Reply(`╭───『 *BOT BASE MENU* 』
│
│  👋 Hai Kak *${pushname}*!
│  Berikut adalah fitur dari bot ini:
│
│  ╭───「 ⚙ INFO BOT 」
│  ├ Nama  : ${global.bot.name}
│  ├ Versi : ${global.bot.version}
│  ├ Mode  : ${bot.public ? "Public" : "Private"}
│  ╰──────────────
│
│  ╭───「 📜 FITUR UMUM 」
│  ├ ${global.bot.prefix}privat
│  ├ ${global.bot.prefix}public
│  ╰──────────────
│
│  _Gunakan prefix: *${global.bot.prefix}*_  
│  _Contoh: *${global.bot.prefix}public*_
│
╰───『 KENZDEVELOPER 』`);
                }
                break;
            case "privat":
                {
                    if (!isOwner) return m.reply("Maff Anda Bukan Owner");
                    bot.public = false;
                    m.reply("Berhasil mengganti ke mode *privat*");
                }
                break;
            case "public":
                {
                    if (!isOwner) return;
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
