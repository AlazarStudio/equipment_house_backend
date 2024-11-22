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

router.route('/').post(protect, createNew_Empty).get(protect, get_Emptys);

router
  .route('/:id')
  .get(protect, get_Empty)
  .put(protect, update_Empty)
  .delete(protect, delete_Empty);

export default router;
