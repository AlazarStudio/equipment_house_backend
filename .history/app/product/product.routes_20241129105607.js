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

router.route('/').post( createNewProduct).get(getProducts);

router
  .route('/:id')
  .get(getProduct)
  .put( updateProduct)
  .delete(deleteProduct);

export default router;
