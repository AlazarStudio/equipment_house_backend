/* eslint-disable import/extensions */
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import multer from 'multer';
import { errorHandler, notFound } from './app/middleware/error.middleware.js';
import { prisma } from './app/prisma.js';

import authRoutes from './app/auth/auth.routes.js';
import userRoutes from './app/user/user.routes.js';
import productRoutes from './app/product/product.routes.js';
import categoryRoutes from './app/category/category.routes.js';
import subCategoryRoutes from './app/subCategory/subCategory.routes.js';
import newsRoutes from './app/news/news.routes.js';
import cartRoutes from './app/basket/basket.routes.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ['http://127.0.0.1:5173', 'http://localhost:5173'], // Ваши фронтенд-источники
    credentials: true, // Включение поддержки куки
    exposedHeaders: ['Content-Range'], // Оставляем, если нужно
  })
);

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 48 }, // лимит размера файла 48MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Ошибка: недопустимый тип файла!'));
  },
});

app.use('/uploads', express.static(path.join(path.resolve(), '/uploads/')));

// Функция транслитерации русского текста
const transliterate = (text) => {
  const ru = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'e',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
  };
  return text
    .split('')
    .map((char) => (char === ' ' ? '_' : ru[char.toLowerCase()] || char))
    .join('');
};



async function main() {
  if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

  app.use(express.json());

  app.post('/uploads', upload.array('img', 20), async (req, res) => {
    try {
      const { files } = req;
      const uploadDir = path.join('/', 'uploads'); // Убедитесь в правильном пути
  
      // Убедимся, что папка uploads существует
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
  
      const filePaths = [];
  
      for (const file of files) {
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf-8');
        const name = path.basename(originalName, path.extname(originalName));
        const transliteratedName = transliterate(name);
        const ext = path.extname(file.originalname).toLowerCase();
  
        const fileName = `${Date.now()}-${transliteratedName}${ext}`;
        const filePath = path.join(uploadDir, fileName);
  
        // Логгирование для отладки
        console.log('Сохраняем файл:', filePath);
  
        fs.writeFileSync(filePath, file.buffer);
        filePaths.push(path.normalize(`/uploads/${fileName}`)); // Нормализуем путь
      }
  
      res.status(200).json({ filePaths });
    } catch (error) {
      console.error('Ошибка при загрузке файлов:', error);
      res.status(500).json({ message: 'Ошибка при загрузке файлов', error });
    }
  });
  
  

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/subCategories', subCategoryRoutes);
  app.use('/api/news', newsRoutes);
  app.use('/api/cart', cartRoutes);

  app.use(notFound);
  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;

  app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`)
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
