import path from 'path';
import fs from 'fs';
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { sendCertificate } from '../bot';
import { sendApplicationConfirmation, sendApplicationNotification } from '../email';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /pdf|doc|docx|xls|xlsx|jpg|jpeg|png/i;
    cb(null, allowed.test(path.extname(file.originalname)));
  },
});

const applicationSchema = z.object({
  userType: z.enum(['individual', 'legal']),
  fullName: z.string().optional(),
  orgName: z.string().optional(),
  phone: z.string().min(1),
  email: z.string().email(),
  branchRequest: z.preprocess((v) => v === 'true' || v === true, z.boolean()).default(false),
  notifyMethod: z.enum(['email', 'telegram']).default('email'),
  telegramChatId: z.string().optional(),
  devices: z.preprocess((v) => {
    if (typeof v === 'string') { try { return JSON.parse(v); } catch { return []; } }
    return v;
  }, z.array(z.any()).default([])),
});

const VALID_STATUSES = ['kutilmoqda', 'jarayonda', 'bajarildi', 'bekor_qilindi'] as const;
type AppStatus = typeof VALID_STATUSES[number];

const STATUS_LABELS: Record<AppStatus, string> = {
  kutilmoqda: 'Kutilmoqda',
  jarayonda: 'Jarayonda',
  bajarildi: 'Bajarildi',
  bekor_qilindi: 'Bekor qilindi',
};

// Public: submit application (multipart/form-data)
router.post('/', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  const result = applicationSchema.safeParse(req.body);
  if (!result.success) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  const { devices, ...rest } = result.data;
  const application = await prisma.application.create({
    data: {
      ...rest,
      devices: JSON.stringify(devices),
      filePath: req.file ? req.file.filename : null,
    },
  });

  if (rest.notifyMethod === 'email' && rest.email) {
    const applicantName = rest.userType === 'individual'
      ? (rest.fullName ?? rest.email)
      : (rest.orgName ?? rest.email);
    sendApplicationConfirmation({
      to: rest.email,
      applicantName,
      applicationId: application.id,
    }).catch((err) => console.error('Email yuborishda xato:', err));
  }

  res.status(201).json(application);
});

// Admin: list all
router.get('/', requireAuth, async (_req: AuthRequest, res: Response): Promise<void> => {
  const applications = await prisma.application.findMany({
    orderBy: { createdAt: 'desc' },
    include: { assignedTo: { include: { roles: true } } },
  });
  res.json(applications.map((a) => ({ ...a, devices: JSON.parse(a.devices) })));
});

// Admin: single application
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const app = await prisma.application.findUnique({
    where: { id: Number(req.params.id) },
    include: { assignedTo: { include: { roles: true } }, certificate: true },
  });
  if (!app) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ ...app, devices: JSON.parse(app.devices) });
});

// Admin: general update (status + assignedToId)
router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, assignedToId } = req.body as { status?: string; assignedToId?: number | null };
  const data: Record<string, unknown> = {};
  if (status && (VALID_STATUSES as readonly string[]).includes(status)) data.status = status;
  if (assignedToId !== undefined) data.assignedToId = assignedToId === null ? null : Number(assignedToId);
  const application = await prisma.application.update({
    where: { id: Number(req.params.id) },
    data,
    include: { assignedTo: { include: { roles: true } } },
  });
  res.json({ ...application, devices: JSON.parse(application.devices) });
});

// Admin: update status
router.patch('/:id/status', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body as { status: string };
  if (!(VALID_STATUSES as readonly string[]).includes(status)) {
    res.status(400).json({ error: `Invalid status. Allowed: ${VALID_STATUSES.join(', ')}` });
    return;
  }
  const application = await prisma.application.update({
    where: { id: Number(req.params.id) },
    data: { status },
  });
  res.json(application);
});

// Admin: send notification
router.post('/:id/notify', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const application = await prisma.application.findUnique({ where: { id: Number(req.params.id) } });
  if (!application) { res.status(404).json({ error: 'Not found' }); return; }

  const { message } = req.body as { message?: string };
  const statusLabel = STATUS_LABELS[application.status as AppStatus] ?? application.status;
  const text = message ?? `✅ <b>Sertifikatingiz tayyor!</b>\n\nAriza №${application.id}\nHolat: ${statusLabel}`;

  if (application.notifyMethod === 'telegram' && application.telegramChatId) {
    await sendCertificate(application.telegramChatId, text);
    res.json({ sent: true, method: 'telegram' });
  } else if (application.notifyMethod === 'email' && application.email) {
    const applicantName = application.userType === 'individual'
      ? (application.fullName ?? application.email)
      : (application.orgName ?? application.email);
    await sendApplicationNotification({
      to: application.email,
      applicantName,
      applicationId: application.id,
      statusLabel,
      message,
    });
    res.json({ sent: true, method: 'email' });
  } else {
    res.json({ sent: false, note: 'Bildirishnoma usuli aniqlanmadi' });
  }
});

export default router;
