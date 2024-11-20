import express from 'express'

import { protect } from '../middleware/auth.middleware.js'

import {
	createNewProduct,
	deleteProduct,
	getProduct,
	getProducts,
	updateProduct
} from './product.controller.js'

const router = express.Router()

router.route('/').post(protect, createNewProduct).get(protect, getProducts)

router
	.route('/:id')
	.get(protect, getProduct)
	.put(protect, updateProduct)
	.delete(protect, deleteProduct)

export default router
