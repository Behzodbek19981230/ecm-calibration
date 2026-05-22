import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const VALID_STATUSES = ['new', 'contract', 'acceptance', 'laboratory', 'completed'];

async function main() {
  const deleted = await prisma.application.deleteMany({
    where: { status: { notIn: VALID_STATUSES } },
  });
  console.log(`✅ ${deleted.count} ta eski (noto'g'ri statusli) ariza o'chirildi`);
}

main()
  .catch((e) => { console.error('❌ Xatolik:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
