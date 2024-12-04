import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import xml2js from 'xml2js';
import { prisma } from '../prisma.js';

const router = express.Router();

// Настройка `multer` для загрузки XML-файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === '.xml') {
      cb(null, true);
    } else {
      cb(new Error('Только XML файлы разрешены!'));
    }
  },
});

// Маршрут для загрузки XML
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не найден!' });
    }

    const filePath = req.file.path;
    const xmlData = fs.readFileSync(filePath, 'utf-8');

    // Парсинг XML
    xml2js.parseString(
      xmlData,
      { explicitArray: false },
      async (err, result) => {
        if (err) {
          console.error('Ошибка парсинга XML:', err);
          return res.status(500).json({ message: 'Ошибка парсинга XML' });
        }

        const offers = result.offers.offer;
        if (!offers) {
          return res.status(400).json({ message: 'Неверный формат XML!' });
        }

        for (const offer of Array.isArray(offers) ? offers : [offers]) {
          const { id, url, price, currencyId, categoryId, model, description } =
            offer;

          try {
            // Вставка данных в базу
            const createdOffer = await prisma.offer.create({
              data: {
                id: parseInt(id),
                url,
                price: parseFloat(price),
                currency: currencyId,
                categoryId: parseInt(categoryId),
                model,
                description,
              },
            });

            // Обработка параметров
            if (offer.param) {
              const params = Array.isArray(offer.param)
                ? offer.param
                : [offer.param];
              for (const param of params) {
                const { name, value } = param;
                await prisma.parameter.create({
                  data: {
                    offerId: createdOffer.id,
                    name,
                    value,
                  },
                });
              }
            }
          } catch (error) {
            console.error(`Ошибка сохранения предложения ${id}:`, error);
          }
        }

        res.status(200).json({ message: 'Данные успешно загружены' });
      }
    );
  } catch (error) {
    console.error('Ошибка при загрузке файла:', error);
    res.status(500).json({ message: 'Ошибка загрузки файла', error });
  }
});

export default router;
