import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder, // Добавляем новый маршрут для удаления
} from './order.controller.js';

const router = express.Router();

// Маршруты для заказов
router
  .route('/')
  .post(protect, createOrder) // Создание нового заказа
  .get(protect, getOrders); // Получение всех заказов

router
  .route('/:orderId')
  .get(protect, getOrder) // Получение конкретного заказа по ID
  .put(protect, updateOrder) // Редактирование заказа
  .delete(protect, deleteOrder); // Удаление заказа

export default router;
