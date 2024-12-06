import express from 'express';
import multer from 'multer';
import {
  getCategories,
  getCategory,
  createNewCategory,
  updateCategory,
  deleteCategory,
} from './category.controller.js';

const router = express.Router();

// Настройки multer для обработки изображений
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/images'; // Папка для изображений
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // Максимум 10MB для изображений
}).single('img'); // Обрабатываем одно изображение

// Обновленный маршрут для создания категории с загрузкой изображения
router.route('/').get(getCategories).post(upload, createNewCategory);

router
  .route('/:id')
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

export default router;
