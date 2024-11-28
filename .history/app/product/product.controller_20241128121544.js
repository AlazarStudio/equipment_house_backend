import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Create new product
// @route   POST /api/products
// @access  Private
import upload from '../middleware/uploadMiddleware.js';

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
      Category: true, // Включаем данные категории
      SubCategory: true, // Включаем данные подкатегории
      BusinessSolution: true, // Включаем данные бизнес-решения, если есть
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
      Category: true, // Включаем данные категории
      SubCategory: true, // Включаем данные подкатегории
      BusinessSolution: true, // Включаем данные бизнес-решения, если есть
    },
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found!');
  }

  res.json(product);
});

export const createNewProduct = [
  upload.single('img'), // Middleware для обработки одного файла с полем 'img'
  asyncHandler(async (req, res) => {
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

    if (!req.file) {
      res.status(400);
      throw new Error('Изображение обязательно для загрузки!');
    }

    // Здесь req.file.buffer содержит изображение в виде Buffer
    const img = req.file.buffer.toString('base64'); // Сохраняем как строку base64

    // Проверяем наличие категории
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      res.status(400);
      throw new Error('Invalid categoryId');
    }

    // Проверяем наличие подкатегории, если указано
    if (subCategoryId) {
      const subCategory = await prisma.subCategory.findUnique({
        where: { id: subCategoryId },
      });

      if (!subCategory) {
        res.status(400);
        throw new Error('Invalid subCategoryId');
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        price,
        img, // Сохраняем изображение в формате base64
        type,
        availability,
        code,
        description,
        characteristics,
        categoryId,
        subCategoryId,
        businessSolutionId: businessSolutionId || null,
      },
    });

    res.status(201).json(product);
  }),
];

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
    subCategoryId,
    businessSolutionId,
  } = req.body;

  // Проверяем, существует ли категория, если обновляется
  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      res.status(400);
      throw new Error('Invalid categoryId');
    }
  }

  // Проверяем, существует ли подкатегория, если обновляется
  if (subCategoryId) {
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: subCategoryId },
    });

    if (!subCategory) {
      res.status(400);
      throw new Error('Invalid subCategoryId');
    }
  }

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
      subCategoryId,
      businessSolutionId: businessSolutionId || null, // Если не указано, передаем null
    },
    include: {
      Category: true, // Включаем данные категории
      SubCategory: true, // Включаем данные подкатегории
      BusinessSolution: true, // Включаем данные бизнес-решения, если есть
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
