import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { parseStringPromise } from 'xml2js';
import { prisma } from './app/prisma.js';

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, 'uploads');
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
});

app.post('/api/upload-xml', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send({ error: 'Файл не найден' });

    const filePath = path.join(__dirname, req.file.path);

    // Чтение файла
    const xmlData = await promisify(fs.readFile)(filePath, 'utf8');

    // Парсинг XML
    const jsonData = await parseStringPromise(xmlData);

    // Пример обработки данных
    const offers = jsonData.yml_catalog.shop[0].offers[0].offer.map(
      (offer) => ({
        id: parseInt(offer.$.id, 10),
        name: offer.model[0],
        price: parseFloat(offer.price[0]),
        categoryId: parseInt(offer.categoryId[0], 10),
        description: offer.description ? offer.description[0] : null,
        vendor: offer.vendor[0],
      })
    );

    // Сохранение данных в базу через Prisma
    for (const offer of offers) {
      await prisma.product.upsert({
        where: { id: offer.id },
        update: {
          name: offer.name,
          price: offer.price,
          description: offer.description,
          vendor: offer.vendor,
          categoryId: offer.categoryId,
        },
        create: offer,
      });
    }

    res.status(200).send({ message: 'Данные успешно загружены' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Ошибка обработки файла' });
  }
});
