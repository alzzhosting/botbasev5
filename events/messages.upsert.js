import {
    isJidGroup,
    isJidUser,
    isJidStatusBroadcast,
    jidDecode,
    isJidNewsletter,
    getContentType
} from "@whiskeysockets/baileys";

import cases from "../case.js";
import fs from "fs";

export default function messagesUpsert(bot, m) {
    m.id = m.key.id;
    m.chatId = m.key.remoteJid;
    m.isGroup = isJidGroup(m.chatId);
    m.isPrivate = isJidUser(m.chatId);
    m.isStory = isJidStatusBroadcast(m.chatId);
    m.isNewsletter = isJidNewsletter(m.chatId);
    m.senderId = m.isNewsletter
        ? ""
        : m.isGroup || m.isStory
        ? m.key.participant
        : m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isOwner = jidDecode(m.chatId).user === global.owner.number;
    m.type = getContentType(m.message);
    m.body =
        m.type === "conversation"
            ? m.message.conversation
            : m.type == "imageMessage"
            ? m.message.imageMessage.caption
            : m.type == "videoMessage"
            ? m.message.videoMessage.caption
            : m.type == "extendedTextMessage"
            ? m.message.extendedTextMessage.text
            : m.type == "buttonsResponseMessage"
            ? m.message.buttonsResponseMessage.selectedButtonId
            : m.type == "listResponseMessage"
            ? m.message.listResponseMessage.singleSelectReply.selectedRowId
            : m.type == "templateButtonReplyMessage"
            ? m.message.templateButtonReplyMessage.selectedId
            : m.type === "messageContextInfo"
            ? m.message.buttonsResponseMessage?.selectedButtonId ||
              m.message.listResponseMessage?.singleSelectReply.selectedRowId ||
              m.text
            : "";
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
                        conversation: `💬 CMD: ${m.text}`
                    }
                }
            }
        );
    m.Reply = async function (text) {
        const thumbPath = "./media/thumbnail.png";
        const thumbnail = fs.readFileSync(thumbPath);

        bot.sendMessage(
            m.chatId,
            {
                image: thumbnail,
                caption: text
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
                        conversation: `🔥 BOT BASE V5 BY KENZDEV 🔥`
                    }
                }
            }
        );
    };

    return cases(bot, m);
}
