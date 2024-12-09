import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  create_Feedback,
  delete_Feedback,
  get_Feedback,
  get_Feedbacks
} from './feedBack.controller.js';

const router = express.Router();

// Получить все отзывы
router.route('/').get(protect, get_Feedbacks).post(protect, create_Feedback);

// Получить один отзыв по ID
router.route('/:id').get(protect, get_Feedback).delete(protect, delete_Feedback);

export default router;
