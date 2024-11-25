import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Хэширование паролей
  const hashedPasswordAdmin = await bcrypt.hash('admin', 10);
  const hashedPasswordUser = await bcrypt.hash('noAdmin', 10);

  // Создание администратора
  await prisma.user.create({
    data: {
      name: 'admin',
      email: 'admin@admin.com',
      password: hashedPasswordAdmin,
      login: 'admin',
      role: 'ADMIN',
    },
  });

  // Создание обычного пользователя
  await prisma.user.create({
    data: {
      name: 'noAdmin',
      email: 'noAdmin@noAdmin.com',
      password: hashedPasswordUser,
      login: 'noAdmin',
      role: 'USER',
    },
  });

  console.log('Users created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
