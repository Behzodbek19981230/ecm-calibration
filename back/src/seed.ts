import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('admin123', 10);

  const user = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashed,
      fullName: 'Administrator',
      email: 'admin@ecm.uz',
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_role: { userId: user.id, role: 'admin' } },
    update: {},
    create: { userId: user.id, role: 'admin' },
  });

  console.log(`✅ Seed: admin foydalanuvchi tayyor (id=${user.id}) — admin / admin123`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
