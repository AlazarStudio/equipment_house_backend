import express from 'express';

import { protect } from '../middleware/auth.middleware.js';

import {
  createNewProduct,
  deleteProduct,
  getOneProduct,
  getAllProducts,
  updateProduct,
} from './product.controller.js';

const router = express.Router();

router.route('/').post(protect, createNewProduct).get(protect, getAllProducts);

router
  .route('/:id')
  .get(protect, getOneProduct)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

export default router;
