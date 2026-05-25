import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import contactRoutes from './routes/contacts';
import blogRoutes from './routes/blog';
import telegramRoutes from './routes/telegram';
import applicationRoutes from './routes/applications';
import regionRoutes from './routes/regions';
import userRoutes from './routes/users';
import certificateRoutes from './routes/certificates';
import statsRoutes from './routes/stats';
import rejectionLetterRoutes from './routes/rejection-letters';
import logsRoutes from './routes/logs';
import { initBot, stopBot } from './bot';
import { logger } from './logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const ALLOWED_ORIGINS = [
  (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, ''),
  (process.env.ADMIN_URL    || 'http://localhost:5173').replace(/\/$/, ''),
];

app.use(cors({
  origin: (origin, callback) => {
    // server-to-server yoki curl so'rovlarga ruxsat (origin yo'q bo'lganda)
    if (!origin || ALLOWED_ORIGINS.includes(origin.replace(/\/$/, ''))) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: ${origin} ruxsat etilmagan`));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Request logger
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level](`${req.method} ${req.path} ${res.statusCode}`, { ms, ip: req.ip });
  });
  next();
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/rejection-letters', rejectionLetterRoutes);
app.use('/api/logs', logsRoutes);

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

initBot();

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

const shutdown = async () => {
  await stopBot();
  server.close(() => process.exit(0));
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { message: err.message, stack: err.stack });
});
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: String(reason) });
});
