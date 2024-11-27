import express from 'express';

import { protect } from '../middleware/auth.middleware.js';
import {
  addToBasket,
  removeFromBasket,
  getBasket,
  updateBasketItem,
} from './basket.controller.js';

const router = express.Router();

// Роут для получения содержимого корзины и добавления товаров в корзину
router.route('/').get(protect, getBasket).post(protect, addToBasket);

// Роут для обновления и удаления товаров из корзины
router
  .route('/:itemId') // Используем itemId для идентификации элемента в корзине
  .put(protect, updateBasketItem)
  .delete(protect, removeFromBasket);

export default router;
