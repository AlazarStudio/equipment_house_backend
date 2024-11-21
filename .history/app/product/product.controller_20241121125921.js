import express from 'express';
import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

const router = express.Router();

// Get all products
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const products = await prisma.products.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  })
);

// Get single product
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await prisma.products.findUnique({
      where: { id: +req.params.id },
    });

    if (!product) {
      res.status(404);
      throw new Error('Product not found!');
    }

    res.json(product);
  })
);

// Create a new product
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const product = await prisma.products.create({
      data: req.body,
    });
    res.status(201).json(product);
  })
);

// Update a product
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await prisma.products.update({
      where: { id: +req.params.id },
      data: req.body,
    });
    res.json(product);
  })
);

// Delete a product
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.products.delete({ where: { id: +req.params.id } });
    res.json({ message: 'Product deleted!' });
  })
);

export default router;
