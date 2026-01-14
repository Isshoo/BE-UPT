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
      telepon: '081234567890',
      role: 'ADMIN',
      status: 'AKTIF',
      verifiedAt: new Date(),
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
