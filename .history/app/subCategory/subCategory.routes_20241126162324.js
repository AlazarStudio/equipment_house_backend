import express from 'express';

// import { protect } from '../middleware/auth.middleware.js';

import {
  createNewSubCategory,
  deleteSubCategory,
  getSubCategories,
  getSubCategory,
  updateSubCategory,
} from './subCategory.controller.js';

const router = express.Router();

router.route('/').post(createNewSubCategory).get(getSubCategories);

router
  .route('/:id')
  .get(getSubCategory)
  .put(updateSubCategory)
  .delete(deleteSubCategory);

export default router;
