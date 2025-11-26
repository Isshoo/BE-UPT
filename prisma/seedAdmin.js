import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Admin
  await prisma.user.create({
    data: {
      email: 'admin@upt-pik.ac.id',
      password: hashedPassword,
      nama: 'Admin UPT-PIK',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user seeded!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
