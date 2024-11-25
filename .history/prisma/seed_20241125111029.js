import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Зашифрованный пароль

  await prisma.user.create({
    data: {
      
      name: 'admin',
      email: 'admin@admin.com',
      password: 'admin',
      login: 'admin',
      role: 'ADMIN',
    },
  });

  
  await prisma.user.create({
    data: {
      name: 'noAdmin',
      email: 'noAdmin@noAdmin.com',
      password: 'noAdmin',
      login: 'noAdmin',
      role: 'USER',
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
