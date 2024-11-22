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

router.route('/').post(protect, createNewSubCategory).get(protect, getSubCategories);

router
  .route('/:id')
  .get(protect, getsubCategory)
  .put(protect, updateSubCategory)
  .delete(protect, deletesubCategory);

export default router;
