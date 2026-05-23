import path from 'path';
import fs from 'fs';
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { sendCertificate } from '../bot';
import { sendApplicationNotification, sendRejectionNotification } from '../email';
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

const VALID_STATUSES = ['new', 'contract', 'acceptance', 'laboratory', 'completed', 'rejected'] as const;
type AppStatus = typeof VALID_STATUSES[number];

const STATUS_LABELS: Record<AppStatus, string> = {
  new:        'Yangi',
  contract:   'Shartnoma tuzish',
  acceptance: 'Qabul qilish',
  laboratory: 'Laboratoriya tekshiruvida',
  completed:  'Yakunlangan',
  rejected:   'Rad etilgan',
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
      status: 'new',
      devices: JSON.stringify(devices),
      filePath: req.file ? req.file.filename : null,
    },
  });

  res.status(201).json(application);
});

// Admin: list all (optional ?status= filter)
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.query as { status?: string };
  const where = status && (VALID_STATUSES as readonly string[]).includes(status) ? { status } : {};
  const applications = await prisma.application.findMany({
    where,
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

// Chief laboratory: accept new application → move to contract
router.post('/:id/accept', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userRoles = req.userRoles ?? [];
  if (!userRoles.includes('chief_laboratory') && !userRoles.includes('admin')) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  const app = await prisma.application.findUnique({ where: { id: Number(req.params.id) } });
  if (!app) { res.status(404).json({ error: 'Not found' }); return; }
  if (app.status !== 'new') {
    res.status(400).json({ error: 'Faqat "yangi" statusdagi arizalarni qabul qilish mumkin' });
    return;
  }
  const updated = await prisma.application.update({
    where: { id: app.id },
    data: { status: 'contract' },
  });
  res.json({ ...updated, devices: JSON.parse(updated.devices) });
});

// Chief laboratory: reject new application → create rejection letter + notify
router.post('/:id/reject', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userRoles = req.userRoles ?? [];
  if (!userRoles.includes('chief_laboratory') && !userRoles.includes('admin')) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const { reason } = req.body as { reason?: string };
  if (!reason?.trim()) {
    res.status(400).json({ error: 'Rad etish sababi (reason) kiritilishi shart' });
    return;
  }

  const app = await prisma.application.findUnique({ where: { id: Number(req.params.id) } });
  if (!app) { res.status(404).json({ error: 'Not found' }); return; }
  if (app.status !== 'new') {
    res.status(400).json({ error: 'Faqat "yangi" statusdagi arizalarni rad etish mumkin' });
    return;
  }

  const applicantName = app.userType === 'individual'
    ? (app.fullName ?? app.email)
    : (app.orgName ?? app.email);

  const rejectedAt = new Date().toLocaleDateString('uz-UZ', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const createdAtStr = new Date(app.createdAt).toLocaleDateString('uz-UZ', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const letterText = [
    'BEKOR QILISH XATI',
    '',
    `Ariza №${app.id}`,
    `Sana: ${rejectedAt}`,
    '',
    `Hurmatli ${applicantName},`,
    '',
    `Siz ${createdAtStr} sanasida ECM Kalibrlash MChJga №${app.id} raqamli kalibrlash arizasi taqdim etdingiz.`,
    '',
    'Ushbu ariza ko\'rib chiqildi va quyidagi sabab bilan qabul qilinmadi:',
    '',
    reason.trim(),
    '',
    'Boshqa savollar bo\'lsa, iltimos bizning markaz bilan bog\'laning.',
    '',
    'Hurmat bilan,',
    'ECM Kalibrlash MChJ',
    'Birinchi laboratoriya boshlig\'i',
    `Sana: ${rejectedAt}`,
  ].join('\n');

  await prisma.application.update({ where: { id: app.id }, data: { status: 'rejected' } });

  await (prisma as any).rejectionLetter.create({
    data: {
      applicationId: app.id,
      reason: reason.trim(),
      letterText,
      createdById: req.userId!,
    },
  });

  // Send notification to applicant
  try {
    if (app.notifyMethod === 'telegram' && app.telegramChatId) {
      const tgText = `❌ <b>Ariza №${app.id} rad etildi</b>\n\n${letterText.replace(/\n/g, '\n')}`;
      await sendCertificate(app.telegramChatId, tgText);
    } else if (app.notifyMethod === 'email' && app.email) {
      await sendRejectionNotification({
        to: app.email,
        applicantName,
        applicationId: app.id,
        letterText,
      });
    }
  } catch (_e) {
    // Bildirishnoma yuborilmasa ham jarayon to'xtatilmaydi
  }

  res.json({ success: true, letterText });
});

export default router;
