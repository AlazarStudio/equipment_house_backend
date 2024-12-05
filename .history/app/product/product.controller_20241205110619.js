import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get products with pagination, sorting, and filtering
// @route   GET /api/products
// @access  Private
export const getProducts = asyncHandler(async (req, res) => {
  try {
    const { range, sort, filter } = req.query;

    const rangeStart = range ? JSON.parse(range)[0] : 0;
    const rangeEnd = range ? JSON.parse(range)[1] : 9;

    const sortField = sort ? JSON.parse(sort)[0] : 'createdAt';
    const sortOrder = sort ? JSON.parse(sort)[1].toLowerCase() : 'desc';

    const filters = filter ? JSON.parse(filter) : {};
    const where = Object.entries(filters).reduce((acc, [field, value]) => {
      if (typeof value === 'string') {
        acc[field] = { contains: value, mode: 'insensitive' };
      } else {
        acc[field] = { equals: value };
      }
      return acc;
    }, {});

    const totalProducts = await prisma.product.count({ where });

    const products = await prisma.product.findMany({
      where,
      skip: rangeStart,
      take: rangeEnd - rangeStart + 1,
      orderBy: { [sortField]: sortOrder },
      include: {
        // category: true, // Используем правильное имя поля
        // subCategory: true, // Используем правильное имя поля
        // businessSolution: true, // Используем правильное имя поля
      },
    });

    res.set(
      'Content-Range',
      `products ${rangeStart}-${Math.min(rangeEnd, totalProducts - 1)}/${totalProducts}`
    );

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: +req.params.id },
    include: {
      category: true,
      subCategory: true,
      businessSolution: true,
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
    type,
    availability,
    code,
    description,
    characteristics,
    categoryId,
    subCategoryId,
    businessSolutionId,
  } = req.body;

  if (!name || !price || !categoryId) {
    res.status(400);
    throw new Error('Name, price, and categoryId are required!');
  }

  const product = await prisma.product.create({
    data: {
      name,
      price: parseFloat(price),
      type,
      availability: availability === 'true',
      code,
      description,
      characteristics,
      categoryId: parseInt(categoryId, 10),
      subCategoryId: subCategoryId ? parseInt(subCategoryId, 10) : null,
      businessSolutionId: businessSolutionId
        ? parseInt(businessSolutionId, 10)
        : null,
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
    type,
    availability,
    code,
    description,
    characteristics,
    categoryId,
    subCategoryId,
    businessSolutionId,
  } = req.body;

  const updateData = {
    ...(name && { name }),
    ...(price && { price: parseFloat(price) }),
    ...(type && { type }),
    ...(availability !== undefined && {
      availability: availability === 'true',
    }),
    ...(code && { code }),
    ...(description && { description }),
    ...(characteristics && { characteristics }),
    ...(categoryId && { categoryId: parseInt(categoryId, 10) }),
    ...(subCategoryId && { subCategoryId: parseInt(subCategoryId, 10) }),
    ...(businessSolutionId && {
      businessSolutionId: parseInt(businessSolutionId, 10),
    }),
  };

  const product = await prisma.product.update({
    where: { id: +req.params.id },
    data: updateData,
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
