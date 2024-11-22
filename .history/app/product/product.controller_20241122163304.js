import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get products with pagination, sorting, and filtering
// @route   GET /api/products
// @access  Private
export const getProducts = asyncHandler(async (req, res) => {
  const { range, sort, filter } = req.query;

  // Parse range, sort, and filter
  const rangeStart = range ? JSON.parse(range)[0] : 0;
  const rangeEnd = range ? JSON.parse(range)[1] : 9;

  const sortField = sort ? JSON.parse(sort)[0] : 'createdAt';
  const sortOrder = sort ? JSON.parse(sort)[1].toLowerCase() : 'desc';

  const filters = filter ? JSON.parse(filter) : {};

  // Build where clause for filtering
  const where = Object.keys(filters).length
    ? {
        AND: Object.entries(filters).map(([field, value]) => ({
          [field]: { contains: value },
        })),
      }
    : {};

  // Fetch total count for Content-Range
  const totalProduct = await prisma.product.count({ where });

  // Fetch products with pagination and sorting
  const products = await prisma.product.findMany({
    where,
    skip: rangeStart,
    take: rangeEnd - rangeStart + 1,
    orderBy: {
      [sortField]: sortOrder,
    },
  });

  // Set Content-Range header
  res.set('Content-Range', `products ${rangeStart}-${rangeEnd}/${totalProduct}`);
  res.json(products);
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
export const getProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: +req.params.id },
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

  try {
    const product = await prisma.product.update({
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

    res.json(product);
  } catch (error) {
    res.status(404);
    throw new Error('Product not found!');
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = asyncHandler(async (req, res) => {
  try {
    await prisma.product.delete({
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
