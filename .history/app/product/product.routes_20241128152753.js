import express from 'express';
import { uploadSingle } from '../';
import {
  createNewProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from './product.controller.js';

const router = express.Router();

router.route('/').post(uploadSingle, createNewProduct).get(getProducts);

router
  .route('/:id')
  .get(getProduct)
  .put(uploadSingle, updateProduct)
  .delete(deleteProduct);

export default router;
