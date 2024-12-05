import express from 'express';
import multer from 'multer';
import {
  getCategories,
  getCategory,
  createNewCategory,
  updateCategory,
  deleteCategory,
} from './category.controller.js';

// Настройка multer для загрузки изображений
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/'; // Папка, где будут храниться изображения
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
});

// Создание роутера
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
