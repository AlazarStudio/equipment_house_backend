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
import orderRoutes from './app/order/order.routes.js';

dotenv.config();

const app = express();
const __dirname = path.resolve();

// Настройки CORS
app.use(
  cors({
    origin: ['http://127.0.0.1:5173', 'http://localhost:5000'], // Ваши фронтенд-источники
    credentials: true, // Включение поддержки куки
    exposedHeaders: ['Content-Range'], // Оставляем, если нужно
  })
);

// Настройка `multer`
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true }); // Создаём папку, если её нет
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const originalName = Buffer.from(file.originalname, 'latin1').toString(
      'utf-8'
    );
    const name = path.basename(originalName, path.extname(originalName));
    const ext = path.extname(file.originalname).toLowerCase();
    const fileName = `${Date.now()}-${name}${ext}`;
    cb(null, fileName);
  },
});

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

// Раздача статических файлов
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Миддлвары
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Маршрут для загрузки файлов
app.post('/uploads', upload.array('img', 10), (req, res) => {
  try {
    console.log('Файлы, полученные multer:', req.files);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Файлы не загружены' });
    }

    // Формируем пути для каждого загруженного файла
    const filePaths = req.files.map((file) => `/uploads/${file.filename}`);
    console.log('Сохранённые пути:', filePaths);

    res.status(200).json({ filePaths });
  } catch (error) {
    console.error('Ошибка при загрузке файлов:', error);
    res.status(500).json({ message: 'Ошибка при загрузке файлов', error });
  }
});

app.post('/upload-xml', upload.single('file'), async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'uploads', req.file.filename);

    // Чтение и обработка XML
    const xmlContent = fs.readFileSync(filePath, 'utf-8');
    const parser = new xml2js.Parser({ explicitArray: false });
    const parsedData = await parser.parseStringPromise(xmlContent);

    // Вывод данных для отладки
    console.log(parsedData);

    // Логика сохранения данных в базу Prisma
    // parsedData может содержать shop, categories, offers и т.д.
    res
      .status(200)
      .json({ message: 'XML загружен и обработан', data: parsedData });
  } catch (error) {
    console.error('Ошибка обработки XML:', error);
    res.status(500).json({ message: 'Ошибка обработки XML', error });
  }
});

const saveDataToDatabase = async (data) => {
  const { shop } = data;

  if (shop && shop.categories && shop.categories.category) {
    for (const category of shop.categories.category) {
      await prisma.category.upsert({
        where: { id: parseInt(category.$.id) },
        update: { title: category._ },
        create: { id: parseInt(category.$.id), title: category._ },
      });
    }
  }

  if (shop && shop.offers && shop.offers.offer) {
    for (const offer of shop.offers.offer) {
      await prisma.product.create({
        data: {
          name: offer.model,
          price: parseFloat(offer.price),
          description: offer.description,
          categoryId: parseInt(offer.categoryId),
          img: Array.isArray(offer.picture) ? offer.picture : [offer.picture],
        },
      });
    }
  }
};


// Продукты
app.use('/api/products', productRoutes);

// Остальные маршруты
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subCategories', subCategoryRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Ошибки
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
