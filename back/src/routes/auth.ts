import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }
  const user = await prisma.user.findUnique({
    where: { username },
    include: { roles: true },
  });
  if (!user || !user.isActive || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const roles = user.roles.map((r: { role: string }) => r.role);
  const token = jwt.sign(
    { id: user.id, roles },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' },
  );
  res.json({ token, username: user.username, fullName: user.fullName, roles });
});

export default router;
