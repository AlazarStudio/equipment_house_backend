import express from 'express';

import { protect } from '../middleware/auth.middleware.js';

import {
  createNewCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from './category.controller.js';

const router = express.Router();

// Публичные маршруты
router.route('/').get(getCategories); // Доступен для всех
router.route('/:id').get(getCategory); // Доступен для всех

// Приватные маршруты для администратора
router.route('/').post(protect, createNewCategory); // Только для зарегистрированных пользователей
router
  .route('/:id')
  .put(protect, updateCategory) // Только для зарегистрированных пользователей
  .delete(protect, deleteCategory); // Только для зарегистрированных пользователей

export default router;
