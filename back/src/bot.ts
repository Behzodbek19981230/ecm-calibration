import TelegramBot from 'node-telegram-bot-api';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let bot: TelegramBot | null = null;

export function getBot(): TelegramBot | null {
  return bot;
}

export async function stopBot(): Promise<void> {
  if (bot) {
    await bot.stopPolling();
    bot = null;
  }
}

function registerHandlers(b: TelegramBot): void {
  b.onText(/\/start (.+)/, async (msg, match) => {
    const chatId = String(msg.chat.id);
    const connectToken = match?.[1]?.trim();
    if (!connectToken) return;

    const connect = await prisma.telegramConnect.findUnique({
      where: { token: connectToken },
    });

    if (!connect || connect.connected) {
      b.sendMessage(chatId, "Token noto'g'ri yoki allaqachon ishlatilgan.");
      return;
    }

    if (new Date() > connect.expiresAt) {
      b.sendMessage(chatId, "Token muddati tugagan. Iltimos, qayta urinib ko'ring.");
      return;
    }

    await prisma.telegramConnect.update({
      where: { token: connectToken },
      data: {
        chatId,
        username: msg.from?.username ?? null,
        connected: true,
      },
    });

    const name = msg.from?.first_name ?? 'Foydalanuvchi';
    b.sendMessage(
      chatId,
      `✅ Salom, ${name}!\n\nSiz ECM Kalibrlash tizimiga muvaffaqiyatli ulanyapsiz. Sertifikat va natijalar shu yerga yuboriladi.`,
    );
  });

  b.onText(/\/start$/, (msg) => {
    b.sendMessage(
      msg.chat.id,
      "Assalomu alaykum! Bu ECM Kalibrlash bildirishnoma botidir.\n\nAriza berishda \"Telegram orqali ulash\" tugmasini bosing.",
    );
  });
}

function startPolling(token: string, retryDelay = 5000): void {
  if (bot) {
    bot.stopPolling();
    bot = null;
  }

  const instance = new TelegramBot(token, { polling: true });
  bot = instance;

  instance.on('polling_error', async (err: any) => {
    const code: number = err?.response?.statusCode ?? err?.code;
    const isConflict = code === 409 || (typeof err?.message === 'string' && err.message.includes('409'));

    if (isConflict) {
      // Another instance is still holding the session; wait then retry
      console.warn(`⚠️  Bot conflict (409) — retrying in ${retryDelay / 1000}s…`);
      await instance.stopPolling();
      if (bot === instance) bot = null;
      setTimeout(() => startPolling(token, retryDelay), retryDelay);
    } else {
      console.error('Bot polling error:', err.message ?? err);
    }
  });

  registerHandlers(instance);
  console.log('🤖 Telegram bot started');
}

export async function initBot(): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn('⚠️  TELEGRAM_BOT_TOKEN not set — bot disabled');
    return;
  }
  startPolling(token);
}

export async function sendCertificate(chatId: string, message: string): Promise<void> {
  if (!bot) return;
  await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
}
