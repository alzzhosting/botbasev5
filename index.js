import "./config/bot.js";
import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import fetch from "node-fetch";
import chalk from "chalk";
import figlet from "figlet";
import gradient from "gradient-string";
import ora from "ora";
import question from "./utils/question.js";
import messagesUpsert from "./events/messages.upsert.js";

const githubJsonUrl =
    "https://raw.githubusercontent.com/alzzhosting/userlogin/refs/heads/main/userlogin.json";
const userDbPath = "./database/user.json";

async function generateUniqueCode(length = 8) {
    const chars = "0123456789ABCDEF";
    return Array.from(
        { length },
        () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
}

async function showBanner() {
    console.clear();
    const banner = figlet.textSync("KENZDEV LOGIN", { font: "ANSI Shadow" });
    console.log(gradient.pastel.multiline(banner));
    console.log(chalk.gray("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log(
        chalk.hex("#ff00ff")("  » SYSTEM LOGIN WHATSAPP BOT BY KENZDEV")
    );
    console.log(chalk.hex("#00ffff")("  » https://api.kenz.my.id"));
    console.log(
        chalk.gray("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
    );
}

async function loginSystem() {
    await showBanner();

    if (fs.existsSync(userDbPath)) {
        const saved = JSON.parse(fs.readFileSync(userDbPath));
        console.log(
            chalk.greenBright(
                `\n[✓] Login otomatis sebagai ${chalk.bold(saved.username)}.\n`
            )
        );
        return true;
    }

    let githubData;
    try {
        const res = await fetch(githubJsonUrl);
        githubData = await res.json();
    } catch {
        console.log(
            chalk.red.bold("\n[!] Gagal ambil data dari GitHub. Coba lagi.\n")
        );
        process.exit();
    }

    const kodeUnik = generateUniqueCode();
    console.log(
        chalk.hex("#00ffff")(
            `KODE UNIK LOGIN: ${chalk.bold.bgMagenta(` ${kodeUnik} `)}\n`
        )
    );

    let attempt = 0;
    while (attempt < 3) {
        const username = await question(chalk.yellow("┏ Username: "));
        const password = await question(chalk.yellow("┗ Password: "));

        const loading = ora("Validasi data login...").start();
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (
            username === githubData.username &&
            password === githubData.password
        ) {
            fs.mkdirSync("database", { recursive: true });
            fs.writeFileSync(
                userDbPath,
                JSON.stringify({ username, password }, null, 2)
            );
            loading.succeed("Login berhasil! Data disimpan.");
            return true;
        } else {
            loading.fail("Username atau password salah.");
            attempt++;
        }
    }

    console.log(chalk.red.bold("\n[×] Login gagal 3 kali. Sistem keluar.\n"));
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
        const jawaban = await question(
            chalk.yellow("Gunakan Pairing Code? [Y/n]: ")
        );
        if (jawaban.toLowerCase() === "n") return start(false);
        if (jawaban.toLowerCase() === "y") {
            const waNumber = await question(
                chalk.yellow("Masukkan Nomor WhatsApp Anda: ")
            );
            const code = await bot.requestPairingCode(
                waNumber.replace(/\D/g, "")
            );
            console.log(chalk.cyanBright(`\n» PAIRING CODE: ${code}\n`));
        }
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
                chalk.greenBright(
                    `\n[✓] BOT TERHUBUNG: +${bot.user.id.split(":")[0]}\n`
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
