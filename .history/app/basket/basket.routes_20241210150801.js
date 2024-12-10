import express from 'express';

import { protect } from '../middleware/auth.middleware.js';
import {
  addToBasket,
  removeFromBasket,
  getBasket,
  updateBasketItem,
  getCartCount,  // Импортируем функцию для подсчета товаров в корзине
} from './basket.controller.js';

const router = express.Router();

// Роуты для работы с корзиной
router.route('/').get(protect, getBasket).post(protect, addToBasket);

// Роут для подсчета количества товаров в корзине
router.route('/count').get(protect, getCartCount);  // Новый маршрут

router
  .route('/:itemId') // Используем itemId для идентификации элемента в корзине
  .put(protect, updateBasketItem)
  .delete(protect, removeFromBasket);

export default router;
