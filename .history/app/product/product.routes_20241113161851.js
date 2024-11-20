import express from 'express'

import { protect } from '../middleware/auth.middleware.js'

import {
	createNewProduct,
	deleteProductcreateNewProduct,
	getProductcreateNewProduct,
	getProductcreateNewProducts,
	updateProductcreateNewProduct
} from './product.controller.js'

const router = express.Router()

router.route('/').post(protect, createNewProduct).get(protect, getProductcreateNewProducts)

router
	.route('/:id')
	.get(protect, getProductcreateNewProduct)
	.put(protect, updateProductcreateNewProduct)
	.delete(protect, deleteProductcreateNewProduct)

export default router
