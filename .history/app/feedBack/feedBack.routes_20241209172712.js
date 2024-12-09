import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createFeedback,
  deleteFeedback,
  getFeedback,
  getFeedbacks,
} from './feedBack.controller.js';

const router = express.Router();

// Получить все отзывы
router.route('/').get(getFeedbacks).post(protect, createFeedback);

// Получить один отзыв по ID
router.route('/:id').get(getFeedback).delete(deleteFeedback);

export default router;
