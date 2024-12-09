import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createFeedback,
  delete_Feedback,
  get_Feedback,
  get_Feedbacks,
} from './feedBack.controller.js';

const router = express.Router();

// Получить все отзывы
router.route('/').get(get_Feedbacks).post(protect, create_Feedback);

// Получить один отзыв по ID
router.route('/:id').get(get_Feedback).delete(delete_Feedback);

export default router;
