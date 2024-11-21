import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt); // Зашифрованный пароль

  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'john.doe@example.com',
      password: hashedPassword,
      role: 'admin', // Роль пользователя
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
