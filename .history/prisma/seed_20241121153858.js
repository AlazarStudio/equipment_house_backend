import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Зашифрованный пароль

  await prisma.user.create({
    data: {
      name: 'admin',
      email: 'admin@admin.com',
      password: 'admin',
      login: 'admin',
    },
  });

  console.log('User created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
