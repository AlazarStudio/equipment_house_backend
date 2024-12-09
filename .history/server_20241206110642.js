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
    const fileTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|xml/;
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

app.post('/api/upload-xml', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Файл не загружен' });
      }
  
      const filePath = path.join(__dirname, 'uploads', req.file.filename);
  
      // Чтение файла
      const xmlContent = fs.readFileSync(filePath, 'utf-8');
      const parser = new xml2js.Parser({ explicitArray: false });
      const parsedData = await parser.parseStringPromise(xmlContent);
  
      console.log('Обработанный XML:', JSON.stringify(parsedData, null, 2));
  
      // Валидация структуры XML
      if (!parsedData?.yml_catalog?.shop) {
        throw new Error('Неверная структура XML. Ожидается элемент "shop".');
      }
  
      const shopData = parsedData.yml_catalog.shop;
  
      // Сохранение данных в базу
      await saveDataToDatabase(shopData);
  
      res.status(200).json({ message: 'XML успешно обработан', data: shopData });
    } catch (error) {
      console.error('Ошибка обработки XML:', error);
      res
        .status(500)
        .json({ message: 'Ошибка обработки XML', error: error.message });
    }
  });
  
  // Функция сохранения данных в базу Prisma
  const saveDataToDatabase = async (shop) => {
    // Сохранение категорий
    if (shop.categories?.category) {
      const categories = Array.isArray(shop.categories.category)
        ? shop.categories.category
        : [shop.categories.category];
  
      for (const category of categories) {
        const categoryId = parseInt(category.$.id, 10);
        if (isNaN(categoryId)) {
          console.warn(`Пропущена категория с некорректным id: ${category.$.id}`);
          continue;
        }
  
        await prisma.category.upsert({
          where: { id: categoryId },
          update: { title: category._ },
          create: { id: categoryId, title: category._ },
        });
      }
    } else {
      console.warn('Категории не найдены в XML.');
    }
  
    // Сохранение товаров
    if (shop.offers?.offer) {
      const offers = Array.isArray(shop.offers.offer)
        ? shop.offers.offer
        : [shop.offers.offer];
  
      for (const offer of offers) {
        const categoryId = parseInt(offer.categoryId, 10);
        if (isNaN(categoryId)) {
          console.warn(
            `Пропущен товар с некорректным categoryId: ${offer.categoryId}`
          );
          continue;
        }
  
        try {
          // Сохранение товара
          const product = await prisma.product.create({
            data: {
              name: offer.model,
              price: parseFloat(offer.price) || 0,
              description: offer.description || null,
              categoryId,
              img: Array.isArray(offer.picture) ? offer.picture : [offer.picture],
            },
          });
  
          // Сохранение характеристик для товара
          if (offer.param) {
            const params = Array.isArray(offer.param)
              ? offer.param
              : [offer.param];
  
            const characteristicPromises = params.map((param) => {
              const characteristicName = param.$?.name || ''; // Извлечение названия
              const characteristicValue = param._ || ''; // Извлечение значения
  
              // Проверка на наличие значения
              if (!characteristicName || !characteristicValue) {
                console.warn(
                  'Пропущены название или значение характеристики:',
                  param
                );
                return;
              }
  
              return prisma.productCharacteristic.create({
                data: {
                  productId: product.id,
                  name: characteristicName, // Название характеристики
                  value: characteristicValue, // Значение характеристики
                },
              });
            });
  
            await Promise.all(characteristicPromises); // Параллельное выполнение запросов
          }
        } catch (error) {
          console.error(`Ошибка при сохранении товара "${offer.model}":`, error);
        }
      }
    } else {
      console.warn('Товары не найдены в XML.');
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