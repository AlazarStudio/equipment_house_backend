import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
 
  const hashedPassword = await bcrypt.hash('admin'); // Зашифрованный пароль

  await prisma.user.create({
    data: {
      name: 'admin',
      email: 'admin@admin.com',
      password: ,
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
