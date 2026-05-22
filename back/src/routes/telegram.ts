import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

// Generate a one-time connect token
router.post('/token', async (_req: Request, res: Response): Promise<void> => {
  const token = crypto.randomBytes(20).toString('hex');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await prisma.telegramConnect.create({ data: { token, expiresAt } });

  const botUsername = (process.env.TELEGRAM_BOT_USERNAME ?? '').replace(/^@/, '');

  res.json({ token, botUsername });
});

// Poll connection status
router.get('/status/:token', async (req: Request, res: Response): Promise<void> => {
  const connect = await prisma.telegramConnect.findUnique({
    where: { token: req.params.token },
    select: { connected: true, chatId: true, username: true, expiresAt: true },
  });

  if (!connect) {
    res.status(404).json({ error: 'Token not found' });
    return;
  }

  if (new Date() > connect.expiresAt) {
    res.json({ connected: false, expired: true });
    return;
  }

  res.json({
    connected: connect.connected,
    username: connect.username,
    chatId: connect.connected ? connect.chatId : undefined,
  });
});

export default router;
