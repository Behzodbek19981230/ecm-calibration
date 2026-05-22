import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Public: all regions with districts
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const regions = await prisma.region.findMany({
    orderBy: { name: 'asc' },
    include: { districts: { orderBy: { name: 'asc' } } },
  });
  res.json(regions);
});

// Admin: create region
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name } = req.body as { name: string };
  if (!name?.trim()) { res.status(400).json({ error: 'Name is required' }); return; }
  try {
    const region = await prisma.region.create({ data: { name: name.trim() } });
    res.status(201).json(region);
  } catch {
    res.status(409).json({ error: 'Region already exists' });
  }
});

// Admin: delete region (cascades districts)
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.region.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

// Admin: create district
router.post('/:regionId/districts', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name } = req.body as { name: string };
  const regionId = Number(req.params.regionId);
  if (!name?.trim() || !regionId) { res.status(400).json({ error: 'Name and regionId are required' }); return; }
  const district = await prisma.district.create({
    data: { name: name.trim(), regionId },
  });
  res.status(201).json(district);
});

// Admin: delete district
router.delete('/districts/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.district.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

export default router;
