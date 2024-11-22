import asyncHandler from 'express-async-handler';

import { prisma } from '../prisma.js';

// @desc    Get _emptys
// @route   GET /api/_emptys
// @access  Private
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      SubCategory: true,
    },
  });
  res.json(categories);
});

// @desc    Get _empty
// @route   GET /api/_emptys/:id
// @access  Private
export const getCategory = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: +req.params.id },
  });

  if (!category) {
    res.status(404);
    throw new Error('Category not found!');
  }

  res.json({ ...category });
});

// @desc    Create new _empty
// @route 	POST /api/_emptys
// @access  Private
export const createNewCategory = asyncHandler(async (req, res) => {
  const {} = req.body;

  const category = await prisma.category.create({
    data: {},
  });

  res.json(category);
});

// @desc    Update _empty
// @route 	PUT /api/_emptys/:id
// @access  Private
export const updateCategory = asyncHandler(async (req, res) => {
  const {} = req.body;

  try {
    const category = await prisma.category.update({
      where: {
        id: +req.params.id,
      },
      data: {},
    });

    res.json(category);
  } catch (error) {
    res.status(404);
    throw new Error('_Empty not found!');
  }
});

// @desc    Delete category
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
