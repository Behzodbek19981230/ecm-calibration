import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function upsertUser(
  username: string,
  password: string,
  fullName: string,
  email: string,
  roles: string[],
) {
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { username },
    update: {},
    create: { username, password: hashed, fullName, email, isActive: true },
  });
  for (const role of roles) {
    await prisma.userRole.upsert({
      where: { userId_role: { userId: user.id, role } },
      update: {},
      create: { userId: user.id, role },
    });
  }
  return user;
}

async function main() {
  const superadmin = await upsertUser(
    'superadmin',
    'superadmin123',
    'Super Administrator',
    'superadmin@ecm.uz',
    ['superadmin'],
  );
  console.log(`✅ superadmin (id=${superadmin.id}) — superadmin / superadmin123`);

  const admin = await upsertUser(
    'admin',
    'admin123',
    'Administrator',
    'admin@ecm.uz',
    ['admin'],
  );
  console.log(`✅ admin     (id=${admin.id}) — admin / admin123`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
