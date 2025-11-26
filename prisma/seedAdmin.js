import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const hashedPassword = await bcrypt.hash('admin', 10);

  // Admin
  await prisma.user.create({
    data: {
      email: 'upt-pik@unikadelasalle.ac.id',
      password: hashedPassword,
      nama: 'Admin',
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
