import "./config/bot.js";

import { makeWASocket, useMultiFileAuthState } from "@kenzdev/baileys-pro";
import pino from "pino";
import readline from "readline";
import fs from "fs";

function question(text = "question") {
    return new Promise(resolve => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(`\x1b[33;1m?\x1b[0m\x20\x1b[1m${text}\x1b[0m`, answer => {
            rl.close();
            resolve(answer);
        });
    });
}

(async function start(usePairingCode = true) {
    const sesi = await useMultiFileAuthState("session");
    const bot = makeWASocket({
        printQRInTerminal: !usePairingCode,
        auth: sesi.state,
        logger: pino({ level: "silent" }).child({ level: "silent" })
    });
    if (usePairingCode && !bot.user && !bot.authState.creds.registered) {
        usePairingCode =
            (
                await question(
                    "Ingin Terhubung Menggunakan Pairing Code ? [Y/n]: "
                )
            ).toLowerCase() !== "n";
        if (!usePairingCode) return start(false);
        const waNumber = await question("Enter Your Number Whatsapp :");
        const code = await bot.requestPairingCode(waNumber.replace(/\D/g, ""));
        console.log(`\x1b[34m;1m\x20PAIRING CODE\x20\x1b[0m\x20${code}`);
    }
    bot.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
        if (connection === "close") {
            console.log(lastDisconnect.error);
            const { statusCode, error } = lastDisconnect.error.output.payload;
            if (statusCode === 401 && error === "Unauthorized") {
                await fs.promises.rm("session", {
                    recursive: true,
                    force: true
                });
            }
            return start();
        }
        if (connection === "open") {
            // VALIDASI NUMBER
            if (
                global.bot.number &&
                global.bot.number !== bot.user.id.split(":")[0]
            ) {
                console.log(
                    `\x1b[33m;1mNomor Ini Tidak Memilik Akses Untuk Menggunakan Script Bot\x1b[0m\n --> Silahkan Memesan Script Ini Di ${global.owner.name} WA ${global.owner.number}`
                );
                return process.exit();
            }
            console.log(
                "Berhasil Terhubung Dengan: + " + bot.user.id.split(":")[0]
            );
        }
        console.log(connection);
    });
    bot.ev.on("creds.update", sesi.saveCreds);
})();
