import express from 'express';

import { protect } from '../middleware/auth.middleware.js';

import {
  createNewCategory,
  deleteCategory,
  getCategory,
  getCategory,
  updateCategory,
} from './category.controller.js';

const router = express.Router();

router.route('/').post(protect, createNewCategory).get(protect, getCategory);

router
  .route('/:id')
  .get(protect, get_Empty)
  .put(protect, update_Empty)
  .delete(protect, delete_Empty);

export default router;
