import asyncHandler from 'express-async-handler';

import { prisma } from '../prisma.js';

// @desc    Get _emptys
// @route   GET /api/_emptys
// @access  Private
export const getProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
  res.json(products);
});

// @desc    Get _empty
// @route   GET /api/_emptys/:id
// @access  Private
export const getProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: +req.params.id },
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found!');
  }

  res.json({ ...product });
});

// @desc    Create new _empty
// @route 	POST /api/_emptys
// @access  Private
export const createNewProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    img,
    type,
    availability,
    code,
    description,
    characteristics,
    categoryId,
    businessSolutionId,
  } = req.body;

  const product = await prisma.product.create({
    data: {
      name,
      price,
      img,
      type,
      availability,
      code,
      description,
      characteristics,
      categoryId,
      businessSolutionId,
    },
  });

  res.json(product);
});

// @desc    Update _empty
// @route 	PUT /api/_emptys/:id
// @access  Private
export const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    img,
    type,
    availability,
    code,
    description,
    characteristics,
    categoryId,
    businessSolutionId,
  } = req.body;

  try {
    const products = await prisma.product.update({
      where: {
        id: +req.params.id,
      },
      data: {
        name,
        price,
        img,
        type,
        availability,
        code,
        description,
        characteristics,
        categoryId,
        businessSolutionId,
      },
    });

    res.json(products);
  } catch (error) {
    res.status(404);
    throw new Error('Product not found!');
  }
});

// @desc    Delete _empty
// @route 	DELETE /api/_emptys/:id
// @access  Private
export const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await prisma.product.delete({
      where: {
        id: +req.params.id,
      },
    });

    res.json({ message: 'Product deleted!' });
  } catch (error) {
    res.status(404);
    throw new Error('Product not found!');
  }
});
