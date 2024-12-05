import express from 'express';
import multer from 'multer';
import {
  getCategories,
  getCategory,
  createNewCategory,
  updateCategory,
  deleteCategory,
} from './category.controller.js';

// Настройка `multer` для загрузки изображений
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads'; // Папка для загрузки файлов
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // Максимальный размер файла 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Ошибка: только изображения разрешены.'));
    }
    cb(null, true);
  },
});

const router = express.Router();

// Маршрут для получения всех категорий и создания новой категории
router.route('/').get(getCategories).post(createNewCategory);

// Маршрут для получения, обновления и удаления категории по ID
router
  .route('/:id')
  .get(getCategory)
  .put(upload.array('img'), updateCategory) // Обновление категории с изображениями
  .delete(deleteCategory);

export default router;
