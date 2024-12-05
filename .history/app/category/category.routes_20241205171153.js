import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getCategories,
  getCategory,
  createNewCategory,
  updateCategory,
  deleteCategory,
} from './category.controller.js';

const router = express.Router();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = path.join(__dirname, 'uploads'); // Папка для загрузки изображений
//     fs.mkdirSync(uploadDir, { recursive: true }); // Создание папки, если она не существует
//     cb(null, uploadDir); // Устанавливаем путь для загрузки файлов
//   },
//   filename: (req, file, cb) => {
//     const fileName = `${Date.now()}-${file.originalname}`; // Генерация уникального имени файла
//     cb(null, fileName); // Генерация имени файла
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 1024 * 1024 * 10 }, // Максимальный размер файла 10MB
//   fileFilter: (req, file, cb) => {
//     if (!file.mimetype.startsWith('image/')) {
//       return cb(new Error('Ошибка: только изображения разрешены.'));
//     }
//     cb(null, true);
//   },
// });

router.route('/').get(getCategories);

router.post('/', upload.array('img'), createNewCategory);

// Маршрут для обновления категории с изображениями
router.put('/:id', upload.array('img'), updateCategory);

router.route('/:id').get(getCategory).delete(deleteCategory);

export default router;
