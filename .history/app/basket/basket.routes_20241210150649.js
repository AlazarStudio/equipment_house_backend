import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  addToBasket,
  removeFromBasket,
  getBasket,
  updateBasketItem,
} from './basket.controller.js';

const router = express.Router();

// Получение содержимого корзины и добавление товаров в корзину
router.route('/').get( getBasket).post( addToBasket);

// Обновление и удаление товаров из корзины
router
  .route('/:itemId') // Используем itemId для идентификации элемента в корзине
  .put( updateBasketItem)
  .delete(protect, removeFromBasket);

export default router;
