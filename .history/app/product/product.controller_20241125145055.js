import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get products with pagination, sorting, and filtering
// @route   GET /api/products
// @access  Private
export const getProducts = asyncHandler(async (req, res) => {
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

  const totalProducts = await prisma.product.count({ where });

  const products = await prisma.product.findMany({
    where,
    skip: rangeStart,
    take: rangeEnd - rangeStart + 1,
    orderBy: { [sortField]: sortOrder },
    include: {
      category: {
        select: {
          subCategories: true, // Включаем только подкатегории
        },
      },
    },
  });

  res.set(
    'Content-Range',
    `products ${rangeStart}-${Math.min(rangeEnd, totalProducts - 1)}/${totalProducts}`
  );
  res.json(products);
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
export const getProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: +req.params.id },
    include: {
      category: {
        select: {
          subCategories: true, // Включаем только подкатегории
        },
      },
    },
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found!');
  }

  res.json(product);
});

// @desc    Create new product
// @route   POST /api/products
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

  // Проверяем, существует ли категория
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { subCategories: true }, // Проверяем наличие подкатегорий
  });

  if (!category) {
    res.status(400);
    throw new Error('Invalid categoryId');
  }

  const product = await prisma.product.create({
    data: {
      name,
      price,
      img: Array.isArray(img) ? img : [img], // Преобразуем в массив, если это строка
      type,
      availability,
      code,
      description,
      characteristics,
      categoryId,
      businessSolutionId,
    },
  });

  res.status(201).json(product);
});

// @desc    Update product
// @route   PUT /api/products/:id
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

  const product = await prisma.product.update({
    where: { id: +req.params.id },
    data: {
      name,
      price,
      img: Array.isArray(img) ? img : [img],
      type,
      availability,
      code,
      description,
      characteristics,
      categoryId,
      businessSolutionId,
    },
    include: {
      category: {
        select: {
          subCategories: true, // Включаем только подкатегории
        },
      },
    },
  });

  res.json(product);
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = asyncHandler(async (req, res) => {
  await prisma.product.delete({
    where: { id: +req.params.id },
  });

  res.json({ message: 'Product deleted!' });
});
