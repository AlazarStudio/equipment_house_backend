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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads'; // Папка для загрузки файлов
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName); // Генерация уникального имени для файла
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // Максимальный размер файла 10MB
});

router.route('/').get(getCategories).post(createNewCategory);
router
  .route('/:id')
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

export default router;
