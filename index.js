import "./config/bot.js";
import {
    makeWASocket,
    useMultiFileAuthState,
    
} from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import fetch from "node-fetch";
import chalk from "chalk";
import figlet from "figlet";
import question from "./utils/question.js";
import messagesUpsert from "./events/messages.upsert.js";

const githubJsonUrl =
    "https://raw.githubusercontent.com/alzzhosting/userlogin/refs/heads/main/userlogin.json";
const userDbPath = "./database/user.json";

async function generateUniqueCode(length = 10) {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    return Array.from(
        { length },
        () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
}

async function tampilkanBannerLogin() {
    console.clear();
    console.log(
        chalk.cyan(figlet.textSync("BASE BOT LOGIN", { font: "Standard" }))
    );
    console.log(
        chalk.magentaBright("┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓")
    );
    console.log(
        chalk.magentaBright("┃       WELCOME TO BOT WA SYSTEM LOGIN    ┃")
    );
    console.log(
        chalk.magentaBright("┃        POWERED BY KENZDEVELOPER         ┃")
    );
    console.log(
        chalk.magentaBright("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n")
    );
}

async function loginSystem() {
    await tampilkanBannerLogin();

    if (fs.existsSync(userDbPath)) {
        const saved = JSON.parse(fs.readFileSync(userDbPath));
        console.log(
            chalk.green(
                `\n[✓] Sudah login sebagai ${chalk.bold(saved.username)}.`
            )
        );
        return true;
    }

    let githubData;
    try {
        const res = await fetch(githubJsonUrl);
        githubData = await res.json();
    } catch {
        console.log(chalk.red("\n[!] Gagal ambil data dari GitHub JSON.\n"));
        process.exit();
    }

    const kodeUnik = await generateUniqueCode();
    console.log(chalk.cyan(`Kode Unik Login: ${chalk.bold(kodeUnik)}\n`));

    let attempt = 0;
    while (attempt < 3) {
        const username = await question(chalk.yellow("┏ Username: "));
        const password = await question(chalk.yellow("┗ Password: "));

        if (
            username === githubData.username &&
            password === githubData.password
        ) {
            fs.mkdirSync("database", { recursive: true });
            fs.writeFileSync(
                userDbPath,
                JSON.stringify({ username, password }, null, 2)
            );
            console.log(
                chalk.greenBright("\n[✓] Login Berhasil! Data disimpan.\n")
            );
            return true;
        } else {
            console.log(
                chalk.redBright("\n[!] Username atau Password salah!\n")
            );
            attempt++;
        }
    }

    console.log(chalk.red.bold("\n[×] Gagal login 3x. Akses ditolak.\n"));
    process.exit();
}

(async function start(usePairingCode = true) {
    await loginSystem();

    const sesi = await useMultiFileAuthState("session");
    const bot = makeWASocket({
        printQRInTerminal: !usePairingCode,
        auth: sesi.state,
        logger: pino({ level: "silent" }).child({ level: "silent" })
    });

    if (usePairingCode && !bot.user && !bot.authState.creds.registered) {
        const jawaban = await question("Gunakan Pairing Code? [Y/n]: ");
        if (jawaban.toLowerCase() === "n") return start(false);
        if (jawaban.toLowerCase() === "Y") return start(true);
        const waNumber = await question("Masukkan Nomor WhatsApp Anda: ");
        const code = await bot.requestPairingCode(waNumber.replace(/\D/g, ""));
        console.log(chalk.blue(`\nPAIRING CODE: ${code}\n`));
    }

    bot.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
        if (connection === "close") {
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
            console.log(
                chalk.green(
                    `\n[✓] Bot Terhubung dengan: +${
                        bot.user.id.split(":")[0]
                    }\n`
                )
            );
        }

        console.log(connection);
    });

    bot.ev.on("creds.update", sesi.saveCreds);
    bot.ev.on("messages.upsert", ({ messages }) =>
        messagesUpsert(bot, messages[0])
    );
})();
