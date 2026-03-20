import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hash = (pwd: string) => bcrypt.hash(pwd, 10);

  // Super Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sentinai.com' },
    update: {},
    create: {
      email: 'admin@sentinai.com',
      password: await hash('admin123'),
      role: Role.SUPER_ADMIN,
    },
  });

  // Home Owner
  const owner = await prisma.user.upsert({
    where: { email: 'owner@sentinai.com' },
    update: {},
    create: {
      email: 'owner@sentinai.com',
      password: await hash('owner123'),
      role: Role.HOME_OWNER,
      locations: {
        create: [
          { name: 'Casa Principal', address: 'Av. Libertador 1234, Buenos Aires' },
        ],
      },
      fleets: {
        create: [
          { name: 'Flota Norte' },
          { name: 'Flota Sur' },
        ],
      },
    },
  });

  console.log('✅ Usuarios creados:');
  console.log(`   SuperAdmin → admin@sentinai.com / admin123`);
  console.log(`   HomeOwner  → owner@sentinai.com / owner123`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
