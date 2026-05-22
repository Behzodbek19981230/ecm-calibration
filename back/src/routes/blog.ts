import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const postSchema = z.object({
  titleUz: z.string().min(1),
  titleRu: z.string().min(1),
  titleEn: z.string().min(1),
  excerptUz: z.string().min(1),
  excerptRu: z.string().min(1),
  excerptEn: z.string().min(1),
  contentUz: z.string().default(''),
  contentRu: z.string().default(''),
  contentEn: z.string().default(''),
  category: z.enum(['calibration', 'metrology', 'standards', 'news']),
  isPublished: z.boolean().default(true),
});

// Public: get published posts
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(posts);
});

// Admin: get all posts
router.get('/all', requireAuth, async (_req: AuthRequest, res: Response): Promise<void> => {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(posts);
});

// Admin: create
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const result = postSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }
  const post = await prisma.blogPost.create({ data: result.data });
  res.status(201).json(post);
});

// Admin: update
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const result = postSchema.partial().safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }
  const post = await prisma.blogPost.update({
    where: { id: Number(req.params.id) },
    data: result.data,
  });
  res.json(post);
});

// Admin: delete
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.blogPost.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

export default router;
