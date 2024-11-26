import express from 'express';

// import { protect } from '../middleware/auth.middleware.js';

import {
  createNewCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from './news.controller.js';

const router = express.Router();

router.route('/').post(createNewCategory).get(getCategories);

router
  .route('/:id')
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

export default router;
