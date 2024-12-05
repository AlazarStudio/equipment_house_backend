import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get products with pagination, sorting, and filtering
// @route   GET /api/products
// @access  Private
export const getProducts = asyncHandler(async (req, res) => {
  try {
    const { range, sort, filter } = req.query;

    const rangeStart = range ? JSON.parse(range)[0] : 0;
    const rangeEnd = range ? JSON.parse(range)[1] : 100;

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
      `products ${rangeStart}-${Math.min(rangeEnd, totalProducts - 1)}/${totalProducts}`,
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
      characteristics: true,
      // category: true,
      // subCategory: true,
      // businessSolution: true,
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
export const createNewCategory = asyncHandler(async (req, res) => {
  const { title } = req.body;

  // Обработка изображений
  let images = [];
  if (req.files && req.files.img) {
    images = req.files.img.map((file) => `/uploads/${file.filename}`);
  }

  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  try {
    const category = await prisma.category.create({
      data: {
        title,
        img: images, // Сохраняем изображения как массив строк
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  // Обработка изображений
  let images = [];
  if (req.files && req.files.img) {
    images = req.files.img.map((file) => `/uploads/${file.filename}`);
  }

  if (!title) {
    return res.status(400).json({ error: 'Title is required for update' });
  }

  try {
    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id, 10) },
      data: {
        title,
        img: images.length > 0 ? images : undefined, // Если есть изображения, обновляем их
      },
    });

    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(404).json({ error: 'Category not found!' });
  }
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
