import TelegramBot from 'node-telegram-bot-api';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let bot: TelegramBot | null = null;

export function getBot(): TelegramBot | null {
  return bot;
}

export function initBot(): void {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn('⚠️  TELEGRAM_BOT_TOKEN not set — bot disabled');
    return;
  }

  bot = new TelegramBot(token, { polling: true });

  bot.onText(/\/start (.+)/, async (msg, match) => {
    const chatId = String(msg.chat.id);
    const connectToken = match?.[1]?.trim();
    if (!connectToken) return;

    const connect = await prisma.telegramConnect.findUnique({
      where: { token: connectToken },
    });

    if (!connect || connect.connected) {
      bot!.sendMessage(chatId, "Token noto'g'ri yoki allaqachon ishlatilgan.");
      return;
    }

    if (new Date() > connect.expiresAt) {
      bot!.sendMessage(chatId, 'Token muddati tugagan. Iltimos, qayta urinib ko\'ring.');
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
    bot!.sendMessage(
      chatId,
      `✅ Salom, ${name}!\n\nSiz ECM Kalibrlash tizimiga muvaffaqiyatli ulanyapsiz. Sertifikat va natijalar shu yerga yuboriladi.`,
    );
  });

  bot.onText(/\/start$/, (msg) => {
    bot!.sendMessage(
      msg.chat.id,
      'Assalomu alaykum! Bu ECM Kalibrlash bildirishnoma botidir.\n\nAriza berishda "Telegram orqali ulash" tugmasini bosing.',
    );
  });

  console.log('🤖 Telegram bot started');
}

export async function sendCertificate(chatId: string, message: string): Promise<void> {
  if (!bot) return;
  await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
}
