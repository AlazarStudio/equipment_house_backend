import asyncHandler from 'express-async-handler';

import { prisma } from '../prisma.js';

// @desc    Get _emptys
// @route   GET /api/_emptys
// @access  Private
export const getProducts = asyncHandler(async (req, res) => {
  const products = await prisma.products.findMany({
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
  const product = await prisma.products.findUnique({
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
  const {name, price, img, type, availability, code, description, characteristics,
    categoryId, businessSolutionsId,
  } = req.body;

  const product = await prisma.products.create({
    data: {},
  });

  res.json(product);
});

// @desc    Update _empty
// @route 	PUT /api/_emptys/:id
// @access  Private
export const update_Empty = asyncHandler(async (req, res) => {
  const {} = req.body;

  try {
    const _empty = await prisma._empty.update({
      where: {
        id: +req.params.id,
      },
      data: {},
    });

    res.json(_empty);
  } catch (error) {
    res.status(404);
    throw new Error('_Empty not found!');
  }
});

// @desc    Delete _empty
// @route 	DELETE /api/_emptys/:id
// @access  Private
export const delete_Empty = asyncHandler(async (req, res) => {
  try {
    const _empty = await prisma._empty.delete({
      where: {
        id: +req.params.id,
      },
    });

    res.json({ message: '_Empty deleted!' });
  } catch (error) {
    res.status(404);
    throw new Error('_Empty not found!');
  }
});