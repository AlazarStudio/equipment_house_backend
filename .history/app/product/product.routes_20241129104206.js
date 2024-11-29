import express from 'express';
import { uploadMultiple } from '../middleware/upload.middleware.js';
import {
  createNewProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from './product.controller.js';

const router = express.Router();

router.route('/').post(uploadMultiple, createNewProduct).get(getProducts);

router
  .route('/:id')
  .get(getProduct)
  .put(uploadMultiple, updateProduct)
  .delete(deleteProduct);

export default router;
