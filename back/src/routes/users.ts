import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const ALL_ROLES = ['superadmin', 'admin', 'manager', 'buyro', 'chief_laboratory'] as const;
const VALID_ROLES = ['admin', 'manager', 'buyro', 'chief_laboratory'] as const;

const userCreateSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(6),
  fullName: z.string().optional().default(''),
  email: z.union([z.string().email(), z.literal('')]).optional().default(''),
  isActive: z.boolean().default(true),
  roles: z.array(z.enum(ALL_ROLES)).min(1),
});

const userUpdateSchema = z.object({
  password: z.string().min(6).optional(),
  fullName: z.string().optional(),
  email: z.union([z.string().email(), z.literal('')]).optional(),
  isActive: z.boolean().optional(),
  roles: z.array(z.enum(ALL_ROLES)).min(1).optional(),
});

// GET /api/users — superadmin users are never exposed
router.get('/', requireAuth, requireRole('admin'), async (_req: AuthRequest, res: Response): Promise<void> => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { roles: true },
    where: { roles: { none: { role: 'superadmin' } } },
  });
  res.json(users.map((u) => ({ ...u, password: undefined })));
});

// GET /api/users/:id
router.get('/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    include: { roles: true },
  });
  if (!user) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ ...user, password: undefined });
});

// POST /api/users
router.post('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  const result = userCreateSchema.safeParse(req.body);
  if (!result.success) { res.status(400).json({ error: result.error.flatten() }); return; }

  const { username, password, fullName, email, isActive, roles } = result.data;

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) { res.status(409).json({ error: 'Username already exists' }); return; }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username,
      password: hashed,
      fullName,
      email: email ?? '',
      isActive,
      roles: { create: roles.map((role) => ({ role })) },
    },
    include: { roles: true },
  });
  res.status(201).json({ ...user, password: undefined });
});

// PATCH /api/users/:id
router.patch('/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  const result = userUpdateSchema.safeParse(req.body);
  if (!result.success) { res.status(400).json({ error: result.error.flatten() }); return; }

  const id = Number(req.params.id);
  const { password, roles, ...rest } = result.data;

  const updateData: Record<string, unknown> = { ...rest };
  if (password) updateData.password = await bcrypt.hash(password, 10);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id }, data: updateData });
    if (roles) {
      await tx.userRole.deleteMany({ where: { userId: id } });
      await tx.userRole.createMany({
        data: roles.map((role) => ({ userId: id, role })),
      });
    }
  });

  const updated = await prisma.user.findUnique({
    where: { id },
    include: { roles: true },
  });
  res.json({ ...updated, password: undefined });
});

// DELETE /api/users/:id — soft delete
router.delete('/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (id === req.userId) { res.status(400).json({ error: 'Cannot deactivate yourself' }); return; }
  await prisma.user.update({ where: { id }, data: { isActive: false } });
  res.json({ success: true });
});

export default router;
