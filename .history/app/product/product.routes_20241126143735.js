import express from 'express';

import { protect } from '../middleware/auth.middleware.js';

import {
  createNewProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from './product.controller.js';

const router = express.Router();

router.route('/').post(createNewProduct).get(getProducts);

router
  .route('/:id')
  .get(, getProduct)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

export default router;
