import express from 'express';

import { protect } from '../middleware/auth.middleware.js';

import {
  createNewsubCategory,
  deletesubCategory,
  getsubCategories,
  getsubCategory,
  updatesubCategory,
} from './subCategory.controller.js';

const router = express.Router();

router.route('/').post(protect, createNewCategory).get(protect, getCategories);

router
  .route('/:id')
  .get(protect, getsubCategory)
  .put(protect, updatesubCategory)
  .delete(protect, deleteCategory);

export default router;
