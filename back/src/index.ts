import path from 'path';
import express from 'express';
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
import { initBot } from './bot';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:5173',
  ],
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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

initBot();

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
