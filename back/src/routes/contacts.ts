import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(1),
});

// Public: submit contact form
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const result = contactSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }
  const contact = await prisma.contact.create({ data: result.data });
  res.status(201).json(contact);
});

// Admin: list all
router.get('/', requireAuth, async (_req: AuthRequest, res: Response): Promise<void> => {
  const contacts = await prisma.contact.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(contacts);
});

// Admin: mark as read
router.patch('/:id/read', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const contact = await prisma.contact.update({
    where: { id: Number(req.params.id) },
    data: { isRead: true },
  });
  res.json(contact);
});

// Admin: delete
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.contact.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

export default router;
