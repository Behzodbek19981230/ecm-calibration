import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/dashboard', requireAuth, async (_req: AuthRequest, res: Response): Promise<void> => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    totalApps,
    kutilmoqda,
    jarayonda,
    bajarildi,
    bekor_qilindi,
    totalUsers,
    totalCerts,
    activeCerts,
    recentApps,
  ] = await Promise.all([
    prisma.application.count(),
    prisma.application.count({ where: { status: 'kutilmoqda' } }),
    prisma.application.count({ where: { status: 'jarayonda' } }),
    prisma.application.count({ where: { status: 'bajarildi' } }),
    prisma.application.count({ where: { status: 'bekor_qilindi' } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.certificate.count(),
    prisma.certificate.count({ where: { status: 'active' } }),
    prisma.application.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
  ]);

  // Group by month in JS
  const monthMap: Record<string, number> = {};
  for (const app of recentApps) {
    const key = app.createdAt.toISOString().slice(0, 7); // "2025-03"
    monthMap[key] = (monthMap[key] ?? 0) + 1;
  }

  // Fill last 6 months (including empty months)
  const perMonth: Array<{ month: string; count: number }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    perMonth.push({ month: key, count: monthMap[key] ?? 0 });
  }

  res.json({
    applications: {
      total: totalApps,
      kutilmoqda,
      jarayonda,
      bajarildi,
      bekor_qilindi,
      perMonth,
    },
    users: { total: totalUsers },
    certificates: {
      total: totalCerts,
      active: activeCerts,
      revoked: totalCerts - activeCerts,
    },
  });
});

export default router;
