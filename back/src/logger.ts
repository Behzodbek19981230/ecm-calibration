import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Level = 'info' | 'warn' | 'error';

async function write(level: Level, message: string, meta?: unknown) {
  const metaStr = meta !== undefined ? JSON.stringify(meta) : undefined;
  console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
    `[${level.toUpperCase()}] ${message}`,
    metaStr ?? '',
  );
  try {
    await prisma.log.create({ data: { level, message, meta: metaStr } });
  } catch {
    // DB write failure should not crash the app
  }
}

export const logger = {
  info:  (msg: string, meta?: unknown) => write('info',  msg, meta),
  warn:  (msg: string, meta?: unknown) => write('warn',  msg, meta),
  error: (msg: string, meta?: unknown) => write('error', msg, meta),
};
