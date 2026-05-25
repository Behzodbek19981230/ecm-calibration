import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/logs?level=error&search=POST&limit=50&offset=0
router.get('/', requireAuth, requireRole('superadmin'), async (req, res) => {
  try {
    const level  = typeof req.query.level  === 'string' && req.query.level  !== 'all' ? req.query.level  : undefined;
    const search = typeof req.query.search === 'string' && req.query.search.trim() ? req.query.search.trim() : undefined;
    const limit  = Math.min(Number(req.query.limit)  || 50, 200);
    const offset = Number(req.query.offset) || 0;

    const where = {
      ...(level  && { level }),
      ...(search && { message: { contains: search } }),
    };

    const [data, total] = await Promise.all([
      prisma.log.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit, skip: offset }),
      prisma.log.count({ where }),
    ]);

    res.json({ data, total });
  } catch {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// DELETE /api/logs — clear all logs
router.delete('/', requireAuth, requireRole('superadmin'), async (_req, res) => {
  try {
    const { count } = await prisma.log.deleteMany({});
    res.json({ deleted: count });
  } catch {
    res.status(500).json({ error: 'Failed to clear logs' });
  }
});

export default router;
