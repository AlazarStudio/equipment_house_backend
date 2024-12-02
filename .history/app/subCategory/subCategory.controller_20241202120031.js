import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get all subcategories with pagination, sorting, and filtering
// @route   GET /api/subcategories
// @access  Private
export const getSubCategories = asyncHandler(async (req, res) => {
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

  const totalSubCategories = await prisma.subCategory.count({ where });

  const subCategories = await prisma.subCategory.findMany({
    where,
    skip: rangeStart,
    take: rangeEnd - rangeStart + 1,
    orderBy: { [sortField]: sortOrder },
    include: { Category: true }, // Включаем данные категории
  });

  res.set(
    'Content-Range',
    `subcategories ${rangeStart}-${Math.min(
      rangeEnd,
      totalSubCategories - 1
    )}/${totalSubCategories}`
  );
  res.json(subCategories);
});

// @desc    Get single subcategory by ID
// @route   GET /api/subcategories/:id
// @access  Private
export const getSubCategory = asyncHandler(async (req, res) => {
  const subCategory = await prisma.subCategory.findUnique({
    where: { id: +req.params.id },
    include: { Category: true }, // Включаем данные категории
  });

  if (!subCategory) {
    res.status(404);
    throw new Error('SubCategory not found!');
  }

  res.json(subCategory);
});

// @desc    Create new subcategory
// @route   POST /api/subcategories
// @access  Private
export const createNewSubCategory = asyncHandler(async (req, res) => {
  const { title, img, categoryId } = req.body;

  // Проверяем обязательные поля
  if (!title || !categoryId) {
    res.status(400);
    throw new Error('Title, img, and categoryId are required');
  }

  // Проверяем, существует ли категория
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    res.status(404);
    throw new Error('Category not found!');
  }

  // Создаём подкатегорию
  const subCategory = await prisma.subCategory.create({
    data: {
      title,
      img,
      categoryId, // Привязываем подкатегорию к категории
    },
  });

  res.status(201).json(subCategory);
});

// @desc    Update subcategory
// @route   PUT /api/subcategories/:id
// @access  Private
export const updateSubCategory = asyncHandler(async (req, res) => {
  const { title, img, categoryId } = req.body;

  // Проверяем, существует ли подкатегория
  const subCategory = await prisma.subCategory.findUnique({
    where: { id: +req.params.id },
  });

  if (!subCategory) {
    res.status(404);
    throw new Error('SubCategory not found!');
  }

  // Если передан categoryId, проверяем его существование
  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      res.status(404);
      throw new Error('Category not found!');
    }
  }

  const updatedSubCategory = await prisma.subCategory.update({
    where: { id: +req.params.id },
    data: {
      ...(title && { title }),
      ...(img && { img }),
      ...(categoryId && { categoryId }),
    },
  });

  res.json(updatedSubCategory);
});

// @desc    Delete subcategory
// @route   DELETE /api/subcategories/:id
// @access  Private
export const deleteSubCategory = asyncHandler(async (req, res) => {
  try {
    await prisma.subCategory.delete({
      where: { id: +req.params.id },
    });

    res.json({ message: 'SubCategory deleted successfully!' });
  } catch (error) {
    res.status(404);
    throw new Error('SubCategory not found!');
  }
});
