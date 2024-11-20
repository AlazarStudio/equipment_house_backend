import express from 'express'

import { protect } from '../middleware/auth.middleware.js'

import {
	createNewP,
	deleteP,
	getP,
	getPs,
	updateP
} from './product.controller.js'

const router = express.Router()

router.route('/').post(protect, createNewP).get(protect, getPs)

router
	.route('/:id')
	.get(protect, getP)
	.put(protect, updateP)
	.delete(protect, deleteP)

export default router
