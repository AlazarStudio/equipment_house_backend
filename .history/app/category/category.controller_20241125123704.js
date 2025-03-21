import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get categories with pagination, sorting, and filtering
// @route   GET /api/categories
// @access  Private
export const getCategories = asyncHandler(async (req, res) => {
  const { range, sort, filter } = req.query;

  const rangeStart = range ? JSON.parse(range)[0] : 0;
  const rangeEnd = range ? JSON.parse(range)[1] : 9;

  const sortField = sort ? JSON.parse(sort)[0] : 'createdAt';
  const sortOrder = sort ? JSON.parse(sort)[1].toLowerCase() : 'desc';

  const filters = filter ? JSON.parse(filter) : {};

  const where = Object.keys(filters).length
    ? Object.entries(filters).reduce((acc, [field, value]) => {
        acc[field] =
          typeof value === 'string'
            ? { contains: value } // Частичное совпадение для строк
            : { equals: value }; // Точное совпадение для чисел
        return acc;
      }, {})
    : {};

  const totalCategories = await prisma.category.count({ where });

  const categories = await prisma.category.findMany({
    where,
    skip: rangeStart,
    take: rangeEnd - rangeStart + 1,
    orderBy: { [sortField]: sortOrder },
    include: { SubCategory: true }, // Включаем подкатегории
  });

  res.set(
    'Content-Range',
    `categories ${rangeStart}-${Math.min(rangeEnd, totalCategories - 1)}/${totalCategories}`
  );
  res.json(categories);
});

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Private
export const getCategory = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: +req.params.id },
    include: { SubCategory: true }, // Включаем подкатегории
  });

  if (!category) {
    res.status(404);
    throw new Error('Category not found!');
  }

  res.json(category);
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
export const createNewCategory = asyncHandler(async (req, res) => {
  const { title, img } = req.body;

  if (!title || !img) {
    res.status(400);
    throw new Error('Title and img are required');
  }

  const category = await prisma.category.create({
    data: {
      title,
      img, // Преобразуем строку в массив
    },
  });

  res.status(201).json(category);
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
export const updateCategory = asyncHandler(async (req, res) => {
  const { title, img } = req.body;

  try {
    const updatedCategory = await prisma.category.update({
      where: { id: +req.params.id },
      data: {
        ...(title && { title }),
        ...(img && { img: Array.isArray(img) ? img : [img] }), // Преобразуем строку в массив
      },
    });

    res.json(updatedCategory);
  } catch (error) {
    res.status(404);
    throw new Error('Category not found!');
  }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
export const deleteCategory = asyncHandler(async (req, res) => {
  try {
    await prisma.category.delete({
      where: { id: +req.params.id },
    });

    res.json({ message: 'Category deleted successfully!' });
  } catch (error) {
    res.status(404);
    throw new Error('Category not found!');
  }
});
