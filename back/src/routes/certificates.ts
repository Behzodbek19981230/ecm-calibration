import path from 'path';
import fs from 'fs';
import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `cert-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

async function generateCertNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const start = new Date(`${year}-01-01`);
  const count = await prisma.certificate.count({ where: { createdAt: { gte: start } } });
  return `ECM-${year}-${String(count + 1).padStart(4, '0')}`;
}

// GET /api/certificates
router.get('/', requireAuth, async (_req: AuthRequest, res: Response): Promise<void> => {
  const certs = await prisma.certificate.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      application: true,
      issuedBy: { include: { roles: true } },
    },
  });
  res.json(certs.map((c) => ({ ...c, issuedBy: { ...c.issuedBy, password: undefined } })));
});

// GET /api/certificates/:id
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const cert = await prisma.certificate.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      application: true,
      issuedBy: { include: { roles: true } },
    },
  });
  if (!cert) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ ...cert, issuedBy: { ...cert.issuedBy, password: undefined } });
});

// POST /api/certificates
router.post('/', requireAuth, requireRole('admin', 'manager'), upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { applicationId, expiresAt, notes } = req.body as {
    applicationId: string;
    expiresAt: string;
    notes?: string;
  };

  if (!applicationId || !expiresAt) {
    res.status(400).json({ error: 'applicationId va expiresAt majburiy' });
    return;
  }

  const appId = Number(applicationId);
  const app = await prisma.application.findUnique({ where: { id: appId } });
  if (!app) { res.status(404).json({ error: 'Ariza topilmadi' }); return; }
  if (app.status !== 'bajarildi') {
    res.status(400).json({ error: 'Faqat "bajarildi" statusli ariza uchun sertifikat beriladi' });
    return;
  }

  const existing = await prisma.certificate.findUnique({ where: { applicationId: appId } });
  if (existing) { res.status(409).json({ error: 'Bu ariza uchun sertifikat allaqachon mavjud' }); return; }

  const certNumber = await generateCertNumber();
  const cert = await prisma.certificate.create({
    data: {
      certNumber,
      applicationId: appId,
      issuedById: req.userId!,
      expiresAt: new Date(expiresAt),
      notes: notes ?? null,
      filePath: req.file ? req.file.filename : null,
    },
    include: {
      application: true,
      issuedBy: { include: { roles: true } },
    },
  });
  res.status(201).json({ ...cert, issuedBy: { ...cert.issuedBy, password: undefined } });
});

// PATCH /api/certificates/:id
router.patch('/:id', requireAuth, requireRole('admin', 'manager'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, notes } = req.body as { status?: string; notes?: string };
  const data: Record<string, unknown> = {};
  if (status && ['active', 'revoked'].includes(status)) data.status = status;
  if (notes !== undefined) data.notes = notes;

  const cert = await prisma.certificate.update({
    where: { id: Number(req.params.id) },
    data,
    include: {
      application: true,
      issuedBy: { include: { roles: true } },
    },
  });
  res.json({ ...cert, issuedBy: { ...cert.issuedBy, password: undefined } });
});

export default router;
