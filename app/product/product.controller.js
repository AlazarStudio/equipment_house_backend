import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get products with pagination, sorting, and filtering
// @route   GET /api/products
// @access  Private
export const getProducts = asyncHandler(async (req, res) => {
  const { range, sort, filter } = req.query;

  // Обработка диапазона
  const rangeStart = range ? JSON.parse(range)[0] : 0;
  const rangeEnd = range ? JSON.parse(range)[1] : 9;

  // Обработка сортировки
  const sortField = sort ? JSON.parse(sort)[0] : 'createdAt';
  const sortOrder = sort ? JSON.parse(sort)[1].toLowerCase() : 'desc';

  // Обработка фильтров
  const filters = filter ? JSON.parse(filter) : {};
  const where = Object.keys(filters).length
    ? Object.entries(filters).reduce((acc, [field, value]) => {
        acc[field] =
          typeof value === 'string'
            ? { contains: value, mode: 'insensitive' } // Частичное совпадение без учета регистра
            : { equals: value }; // Точное совпадение для чисел
        return acc;
      }, {})
    : {};

  // Общее количество продуктов
  const totalProducts = await prisma.product.count({ where });

  // Получение продуктов с учётом диапазона, сортировки и фильтров
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

  // Установка заголовка Content-Range для поддержки пагинации
  res.set(
    'Content-Range',
    `products ${rangeStart}-${Math.min(rangeEnd, totalProducts - 1)}/${totalProducts}`
  );

  // Отправка ответа с продуктами
  res.json(products);
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: +req.params.id },
    include: {
      Category: true,
      SubCategory: true,
      BusinessSolution: true,
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
    img,
    description,
    characteristics,
    categoryId,
    subCategoryId,
    businessSolutionId,
  } = req.body;

  const images = img.map((image) =>
    typeof image === 'object' ? `/uploads/${image.rawFile.path}` : image
  );

  console.log('123', images);

  // const images = req.file ? [req.file.path] : []; // Сохраняем путь к файлу

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    res.status(400);
    throw new Error('Invalid categoryId');
  }

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
      img: images,
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

  const img = req.file ? [req.file.path] : undefined; // Обновляем путь к файлу

  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      res.status(400);
      throw new Error('Invalid categoryId');
    }
  }

  if (subCategoryId) {
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: subCategoryId },
    });

    if (!subCategory) {
      res.status(400);
      throw new Error('Invalid subCategoryId');
    }
  }

  const updateData = {
    name,
    price,
    type,
    availability,
    code,
    description,
    characteristics,
    categoryId,
    subCategoryId,
    businessSolutionId: businessSolutionId || null,
  };

  if (img) updateData.img = img;

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
