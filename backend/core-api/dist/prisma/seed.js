"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    const hash = (pwd) => bcrypt.hash(pwd, 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@sentinai.com' },
        update: {},
        create: {
            email: 'admin@sentinai.com',
            password: await hash('admin123'),
            role: client_1.Role.SUPER_ADMIN,
        },
    });
    const owner = await prisma.user.upsert({
        where: { email: 'owner@sentinai.com' },
        update: {},
        create: {
            email: 'owner@sentinai.com',
            password: await hash('owner123'),
            role: client_1.Role.HOME_OWNER,
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
//# sourceMappingURL=seed.js.map