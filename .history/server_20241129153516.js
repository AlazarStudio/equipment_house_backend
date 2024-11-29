/* eslint-disable import/extensions */
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import multer from 'multer';
import { errorHandler, notFound } from './app/middleware/error.middleware.js';

dotenv.config();

const app = express();
const __dirname = path.resolve();

// Настройки CORS
app.use(
  cors({
    origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
    credentials: true,
  })
);

// Настройка `multer`
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true }); // Создаём папку
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf-8');
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
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
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
app.post('/uploads', upload.array('img', 10), async (req, res) => {
  try {
    console.log('Тело запроса:', req.body);

    const { files } = req;

    if (!files || files.length === 0) {
      console.log('Нет файлов для загрузки');
      return res.status(400).json({ message: 'Файлы не загружены' });
    }

    const filePaths = files.map((file) => `/uploads/${file.filename}`);
    console.log('Сохранённые файлы:', filePaths);

    res.status(200).json({ filePaths });
  } catch (error) {
    console.error('Ошибка при загрузке файлов:', error);
    res.status(500).json({ message: 'Ошибка при загрузке файлов', error });
  }
});

// Ошибки
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
