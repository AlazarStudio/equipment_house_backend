import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createOrder,
  // getOrders,
  // updateOrder,
  // deleteOrder,
} from './order.controller.js';

const router = express.Router();

// Маршруты для заказов
router.route('/').post(protect, createOrder);
.get(protect, getOrders); // Создание и получение заказов
router.route('/:orderId');
// .put(protect, updateOrder) // Обновление заказа
// .delete(protect, deleteOrder); // Удаление заказа

export default router;
