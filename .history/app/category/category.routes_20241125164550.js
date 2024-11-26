import express from 'express';
import {
  createNewCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from './category.controller.js';

const router = express.Router();

// Публичные маршруты
router.route('/').get(getCategories);
router.route('/:id').get(getCategory);

// Приватные маршруты
router.route('/').post(createNewCategory); // Добавьте `protect`, если нужно
router
  .route('/:id')
  .put(updateCategory) // Добавьте `protect`, если нужно
  .delete(deleteCategory); // Добавьте `protect`, если нужно

export default router;
