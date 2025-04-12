import {
    isJidGroup,
    isJidUser,
    isJidStatusBroadcast,
    jidDecode,
    getContentType
} from "baileys";

import cases from "../case.js";

export default function messagesUpsert(bot, m) {
    m.id = m.key.id;
    m.chatId = m.key.remoteJid;
    m.isGroup = isJidGroup(m.chatId);
    m.isPrivate = isJidUser(m.chatId);
    m.isStory = isJidStatusBroadcast(m.chatId);
    m.fromMe = m.key.fromMe;
    m.isOwner = jidDecode(m.chatId).user === global.owner.number;
    m.type = getContentType(m.message);
    m.body =
        m.type === "conversation"
            ? m.message.conversation
            : m.message[m.type].caption ||
              m.message[m.type].text ||
              m.message[m.type].singleSelectReply?.selectedRowId ||
              m.message[m.type].selectedButtonId ||
              "";
    m.text =
        m.type === "conversation"
            ? m.message.conversation
            : m.message[m.type].caption ||
              m.message[m.type].text ||
              m.message[m.type].description ||
              m.message[m.type].title ||
              m.message[m.type].contentText ||
              m.message[m.type].selectedDisplayText ||
              "";
    m.isCommand = m.body.trim().startsWith(global.bot.prefix);
    m.cmd = m.body
        .trim()
        .normalize("NFKC")
        .replace(global.bot.prefix, "")
        .split(" ")[0]
        .toLowerCase();
    m.args = m.body
        .trim()
        .replace(/^\S*\b/g, "")
        .split(global.bot.splitArgs)
        .map(arg => arg.trim())
        .filter(arg => arg);
    m.reply = text =>
        bot.sendMessage(
            m.chatId,
            {
                text
            },
            {
                quoted: {
                    key: {
                        id: m.id,
                        fromMe: false,
                        remoteJid: "status@broadcast",
                        participant: "0@s.whatsapp.net"
                    },
                    message: {
                        conversation: `💬 ${m.text}`
                    }
                }
            }
        );
    m.Reply = text =>
        bot.sendMessage(
            m.chatId,
            {
                text: text,
                mentions: [m.sender],
                contextInfo: {
                    externalAdReply: {
                        title: global.bot.name,
                        body: `© 2025 ${global.owner.name}`,
                        thumbnailUrl: global.image.reply,
                        sourceUrl: null
                    }
                }
            },
            { quoted: null }
        );

    return cases(bot, m);
}
