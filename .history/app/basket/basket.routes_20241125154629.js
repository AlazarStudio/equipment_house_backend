import express from 'express';

import { protect } from '../middleware/auth.middleware.js';

import {
  createNewCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from './basket.controller.js';

const router = express.Router();

router.route('/').post(protect, createNewCategory).get(protect, getCategories);

router
  .route('/:id')
  .get(protect, getCategory)
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);

export default router;
