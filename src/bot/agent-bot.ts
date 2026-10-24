import { Bot } from "grammy";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import "dotenv/config";

const execAsync = promisify(exec);

// Config
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8915615220:AAHstRA8VGD1lP0O-Oyg9SLt7hee9FRGLNI";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const WORKSPACE_DIR = process.cwd();

let ADMIN_CHAT_ID: number | null = process.env.TELEGRAM_ADMIN_CHAT_ID ? Number(process.env.TELEGRAM_ADMIN_CHAT_ID) : null;

if (!BOT_TOKEN) {
  console.error("TELEGRAM_BOT_TOKEN is missing!");
  process.exit(1);
}

const bot = new Bot(BOT_TOKEN);

// Primary & fallback models verified for coding tasks
const CODING_MODELS = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest"];

// Audio transcription models
const TRANSCRIBE_MODELS = ["gemini-3.5-transcribe", "gemini-3.5-flash", "gemini-3.8-flash"];

// Agent Tools Declaration for Gemini
const toolsDeclarations: any[] = [
  {
    name: "read_file",
    description: "Read contents of a file in the project workspace",
    parameters: {
      type: "OBJECT",
      properties: {
        filePath: { type: "STRING", description: "Relative path to file, e.g. src/app/page.tsx or septic_repair/companies.csv" },
      },
      required: ["filePath"],
    },
  },
  {
    name: "write_file",
    description: "Create or overwrite a file in the project workspace",
    parameters: {
      type: "OBJECT",
      properties: {
        filePath: { type: "STRING", description: "Relative path to file" },
        content: { type: "STRING", description: "Full new content of the file" },
      },
      required: ["filePath", "content"],
    },
  },
  {
    name: "list_directory",
    description: "List files and folders in a workspace directory",
    parameters: {
      type: "OBJECT",
      properties: {
        dirPath: { type: "STRING", description: "Relative path, e.g. src or . (root) or septic_repair" },
      },
    },
  },
  {
    name: "run_command",
    description: "Execute a shell command in the project directory (e.g. git status, pnpm build, node scripts/..., git commit)",
    parameters: {
      type: "OBJECT",
      properties: {
        command: { type: "STRING", description: "Shell command to execute" },
      },
      required: ["command"],
    },
  },
];

// Tool Executors
async function executeTool(name: string, args: any): Promise<string> {
  try {
    if (name === "read_file") {
      const fullPath = path.resolve(WORKSPACE_DIR, args.filePath);
      if (!fs.existsSync(fullPath)) return `Error: File ${args.filePath} does not exist.`;
      const data = fs.readFileSync(fullPath, "utf-8");
      return data.slice(0, 50000);
    }

    if (name === "write_file") {
      const fullPath = path.resolve(WORKSPACE_DIR, args.filePath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, args.content, "utf-8");
      return `File ${args.filePath} saved successfully (${args.content.length} bytes).`;
    }

    if (name === "list_directory") {
      const targetDir = path.resolve(WORKSPACE_DIR, args.dirPath || ".");
      if (!fs.existsSync(targetDir)) return `Directory ${args.dirPath} not found.`;
      const entries = fs.readdirSync(targetDir, { withFileTypes: true });
      return entries
        .map((e) => `${e.isDirectory() ? "📁" : "📄"} ${e.name}`)
        .join("\n");
    }

    if (name === "run_command") {
      const { stdout, stderr } = await execAsync(args.command, {
        cwd: WORKSPACE_DIR,
        timeout: 90000,
      });
      return `STDOUT:\n${stdout}\n${stderr ? `STDERR:\n${stderr}` : ""}`;
    }

    return `Unknown tool: ${name}`;
  } catch (error: any) {
    return `Tool execution error (${name}): ${error.message}`;
  }
}

// System prompt tailored for Septic Project
const SYSTEM_INSTRUCTION = `Ты — ведущий AI-разработчик и аналитик проекта по ремонту септиков в США (Septic Repair, Drain Field Restoration, Excavation).
Ты запущен прямо на Mac в рабочей папке проекта: ${WORKSPACE_DIR}.
Стек проекта: Next.js 16 (App Router, React 19, TypeScript), Tailwind CSS, Railway, Playwright для парсинга Google Maps, скрипты анализа рынка.

Пользователь отправляет тебе команды через Telegram (текстом или голосом).
Твоя задача:
1. Внимательно понимать задачу пользователя.
2. Использовать инструменты (read_file, write_file, run_command, list_directory), чтобы исследовать код/данные, вносить изменения, запускать скрипты и проверять результат.
3. Отвечать на русском языке кратко, по делу и структурированно: что было сделано или какой ответ на вопрос.`;

// Resilient file downloader for Telegram
async function downloadTelegramFile(fileUrl: string): Promise<Buffer> {
  // Strategy 1: Axios with explicit headers and no keepAlive
  try {
    const res = await axios.get(fileUrl, {
      responseType: "arraybuffer",
      timeout: 20000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Connection": "close",
      },
    });
    return Buffer.from(res.data);
  } catch (err: any) {
    console.warn(`Axios download failed (${err.message}), falling back to curl...`);
  }

  // Strategy 2: macOS system curl (100% resilient across resets)
  try {
    const { stdout } = await execAsync(`curl -sL --max-time 30 "${fileUrl}" | base64`);
    const buf = Buffer.from(stdout.trim(), "base64");
    if (buf.length > 0) return buf;
  } catch (err: any) {
    console.warn(`Curl fallback failed (${err.message}), trying fetch...`);
  }

  // Strategy 3: Native fetch
  const res = await fetch(fileUrl, { headers: { "Connection": "close" } });
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Transcribe audio using dedicated transcription models
async function transcribeAudio(ai: GoogleGenAI, base64Audio: string): Promise<string> {
  let lastErr = null;
  for (const m of TRANSCRIBE_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await ai.models.generateContent({
          model: m,
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: "audio/ogg",
                    data: base64Audio,
                  },
                },
                {
                  text: "Расшифруй это голосовое сообщение на русском языке. Верни только распознанный текст без кавычек и комментариев.",
                },
              ],
            },
          ],
        });
        const text = res.text?.trim();
        if (text) return text;
      } catch (err: any) {
        lastErr = err;
        console.warn(`Transcribe model ${m} attempt ${attempt} error: ${err.message}`);
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }
  throw lastErr || new Error("Не удалось расшифровать аудио");
}

// Call Gemini with fallback for coding
async function callGemini(ai: GoogleGenAI, contents: any[]): Promise<any> {
  let lastError = null;
  for (const model of CODING_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: toolsDeclarations }],
        },
      });
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`Coding model ${model} error: ${err.message}. Trying next candidate...`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw lastError;
}

// Start command
bot.command("start", async (ctx) => {
  const userId = ctx.from?.id;
  if (!ADMIN_CHAT_ID) {
    ADMIN_CHAT_ID = userId || null;
    await ctx.reply(
      `👋 Привет! Вы успешно авторизованы как администратор проекта (ID: ${userId}).\n\n` +
      `Я ваш AI-ассистент разработчика для проекта **Ремонт Септиков США** 🇺🇸🚜.\n\n` +
      `🎙️ Вы можете отправлять мне задачи **голосовыми сообщениями** или писать текстом!\n` +
      `Я распознаю голос, выполню нужные правки в коде, проверю данные и пришлю отчет.`
    );
  } else if (ADMIN_CHAT_ID === userId) {
    await ctx.reply(`🤖 Бот готов к работе! Присылайте голосовые или текстовые команды 🎙️.`);
  } else {
    await ctx.reply(`⛔ Доступ запрещен. Бот привязан к другому администратору.`);
  }
});

// Help command
bot.command("help", async (ctx) => {
  await ctx.reply(
    `🛠 **Команды и возможности:**\n\n` +
    `• Отправьте **голосовое сообщение** с задачей — я расшифрую его и выполню в проекте.\n` +
    `• Отправьте **текстовое сообщение** с любой задачей по коду, данным или лендингам.\n` +
    `• Доступные действия: чтение/редактирование файлов, запуск команд (git, pnpm build, node scripts), проверка таблиц и анализ отзывов.\n` +
    `• /status — статус проекта и сервера.`
  );
});

// Status command
bot.command("status", async (ctx) => {
  try {
    const { stdout } = await execAsync("git status -s");
    await ctx.reply(
      `📊 **Статус проекта Ремонт септиков:**\n\n` +
      `📁 Папка: \`${path.basename(WORKSPACE_DIR)}\`\n` +
      `🌿 Git:\n${stdout ? "```\n" + stdout + "```" : "Ветка чистая (всё закоммичено)."}`
    );
  } catch (err: any) {
    await ctx.reply(`Ошибка получения статуса: ${err.message}`);
  }
});

// Message handler (text & voice)
bot.on(["message:text", "message:voice"], async (ctx) => {
  const userId = ctx.from?.id;

  if (ADMIN_CHAT_ID && userId !== ADMIN_CHAT_ID) {
    await ctx.reply("⛔ У вас нет доступа к этому боту.");
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    await ctx.reply("⚠️ Для работы требуется GEMINI_API_KEY!");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  let userTextPrompt = "";

  // 1. Handle Voice Message
  if (ctx.message?.voice) {
    const voiceMsg = await ctx.reply("🎧 Распознаю голосовое сообщение...");
    await ctx.replyWithChatAction("record_voice");

    try {
      const voiceFile = await ctx.getFile();
      const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${voiceFile.file_path}`;
      const audioBuffer = await downloadTelegramFile(fileUrl);
      const base64Audio = audioBuffer.toString("base64");

      // Transcribe audio using dedicated transcription pool
      const recognized = await transcribeAudio(ai, base64Audio);

      try {
        await ctx.api.deleteMessage(ctx.chat.id, voiceMsg.message_id);
      } catch (_) {}

      if (!recognized) {
        await ctx.reply("❌ Не удалось разобрать слова в аудио. Попробуйте надиктовать еще раз или напишите текстом.");
        return;
      }

      await ctx.reply(`🎤 Распознано:\n«${recognized}»`);
      userTextPrompt = recognized;
    } catch (err: any) {
      console.error("Transcription error:", err);
      try {
        await ctx.api.editMessageText(
          ctx.chat.id,
          voiceMsg.message_id,
          `❌ Ошибка распознавания аудио: ${err.message}`
        );
      } catch (_) {}
      return;
    }
  } else if (ctx.message?.text) {
    userTextPrompt = ctx.message.text.trim();
  }

  if (!userTextPrompt) return;

  // 2. Execute Coding/Project Task
  const statusMsg = await ctx.reply("⚙️ Работаю над задачей в проекте...");
  await ctx.replyWithChatAction("typing");

  try {
    let conversationHistory: any[] = [
      { role: "user", parts: [{ text: userTextPrompt }] },
    ];

    let turns = 0;
    const maxTurns = 8;
    let finalAnswer = "";

    while (turns < maxTurns) {
      turns++;

      const response = await callGemini(ai, conversationHistory);
      const candidate = response.candidates?.[0];
      const modelContent = candidate?.content;

      if (!modelContent) {
        finalAnswer = response.text || "Задача выполнена.";
        break;
      }

      const functionCalls = modelContent.parts?.filter((p: any) => p.functionCall);

      if (functionCalls && functionCalls.length > 0) {
        conversationHistory.push(modelContent);
        const functionResponseParts: any[] = [];

        for (const callPart of functionCalls) {
          const fn = callPart.functionCall!;
          try {
            await ctx.api.editMessageText(
              ctx.chat.id,
              statusMsg.message_id,
              `🛠️ Выполняю: ${fn.name}...`
            );
          } catch (_) {}

          const toolResult = await executeTool(fn.name, fn.args);

          functionResponseParts.push({
            functionResponse: {
              name: fn.name,
              response: { result: toolResult },
            },
          });
        }

        conversationHistory.push({
          role: "user",
          parts: functionResponseParts,
        });
      } else {
        const textFromParts = modelContent.parts?.filter((p: any) => p.text).map((p: any) => p.text).join("\n");
        finalAnswer = textFromParts || response.text || "Задача выполнена успешно.";
        break;
      }
    }

    try {
      await ctx.api.deleteMessage(ctx.chat.id, statusMsg.message_id);
    } catch (_) {}

    if (!finalAnswer || !finalAnswer.trim()) {
      finalAnswer = "✅ Задача выполнена! Изменения применены к кодовой базе.";
    }

    if (finalAnswer.length > 4000) {
      for (let i = 0; i < finalAnswer.length; i += 4000) {
        await ctx.reply(finalAnswer.slice(i, i + 4000));
      }
    } else {
      await ctx.reply(finalAnswer);
    }
  } catch (err: any) {
    console.error("Bot execution error:", err);
    try {
      await ctx.api.editMessageText(
        ctx.chat.id,
        statusMsg.message_id,
        `❌ Ошибка выполнения: ${err.message}`
      );
    } catch (_) {
      await ctx.reply(`❌ Ошибка: ${err.message}`);
    }
  }
});

// Launch bot
console.log("🚀 Starting Septic Telegram Coding Agent (@Septic_usa_bot)...");
bot.start({
  onStart: (info) => {
    console.log(`✅ Bot @${info.username} (id: ${info.id}) is successfully running!`);
  },
});
