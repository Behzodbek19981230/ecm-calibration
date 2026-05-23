import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// List all rejection letters
router.get('/', requireAuth, async (_req: AuthRequest, res: Response): Promise<void> => {
  const letters = await (prisma as any).rejectionLetter.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      application: {
        select: {
          id: true, userType: true, fullName: true, orgName: true,
          email: true, phone: true, createdAt: true,
        },
      },
      createdBy: { select: { id: true, fullName: true, username: true } },
    },
  });
  res.json(letters);
});

// Single rejection letter
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const letter = await (prisma as any).rejectionLetter.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      application: true,
      createdBy: { select: { id: true, fullName: true, username: true } },
    },
  });
  if (!letter) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(letter);
});

// Get rejection letter by applicationId
router.get('/by-application/:appId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const letter = await (prisma as any).rejectionLetter.findUnique({
    where: { applicationId: Number(req.params.appId) },
    include: {
      createdBy: { select: { id: true, fullName: true, username: true } },
    },
  });
  if (!letter) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(letter);
});

export default router;
