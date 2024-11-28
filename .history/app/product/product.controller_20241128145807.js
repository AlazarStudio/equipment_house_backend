import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';
import upload from '../multer/multer.js';

// @desc Get products
// @route GET /api/products
export const getProducts = asyncHandler(async (req, res) => {
  const { range, sort, filter } = req.query;

  const rangeStart = range ? JSON.parse(range)[0] : 0;
  const rangeEnd = range ? JSON.parse(range)[1] : 9;

  const sortField = sort ? JSON.parse(sort)[0] : 'createdAt';
  const sortOrder = sort ? JSON.parse(sort)[1].toLowerCase() : 'desc';

  const filters = filter ? JSON.parse(filter) : {};

  const where = Object.keys(filters).reduce((acc, field) => {
    acc[field] =
      typeof filters[field] === 'string'
        ? { contains: filters[field] }
        : { equals: filters[field] };
    return acc;
  }, {});

  const totalProducts = await prisma.product.count({ where });

  const products = await prisma.product.findMany({
    where,
    skip: rangeStart,
    take: rangeEnd - rangeStart + 1,
    orderBy: { [sortField]: sortOrder },
    include: {
      category: true,
      subCategory: true,
    },
  });

  res.set(
    'Content-Range',
    `products ${rangeStart}-${Math.min(rangeEnd, totalProducts - 1)}/${totalProducts}`
  );
  res.json(products);
});

// @desc Get single product
// @route GET /api/products/:id
export const getProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: +req.params.id },
    include: {
      category: true,
      subCategory: true,
    },
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found!');
  }

  res.json(product);
});

// @desc Create new product
// @route POST /api/products
export const createNewProduct = [
  upload.single('img'),
  asyncHandler(async (req, res) => {
    const {
      name,
      price,
      type,
      availability,
      code,
      description,
      categoryId,
      subCategoryId,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Image is required!' });
    }

    const imgPath = `/uploads/products/${req.file.filename}`;

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        type,
        availability: availability === 'true',
        code,
        description,
        img: imgPath,
        categoryId: categoryId ? parseInt(categoryId) : null,
        subCategoryId: subCategoryId ? parseInt(subCategoryId) : null,
      },
    });

    res.status(201).json(product);
  }),
];

// @desc Update product
// @route PUT /api/products/:id
export const updateProduct = [
  upload.single('img'),
  asyncHandler(async (req, res) => {
    const {
      name,
      price,
      type,
      availability,
      code,
      description,
      categoryId,
      subCategoryId,
    } = req.body;

    const imgPath = req.file
      ? `/uploads/products/${req.file.filename}`
      : undefined;

    const product = await prisma.product.update({
      where: { id: +req.params.id },
      data: {
        name,
        price: parseFloat(price),
        type,
        availability: availability === 'true',
        code,
        description,
        ...(imgPath && { img: imgPath }),
        categoryId: categoryId ? parseInt(categoryId) : null,
        subCategoryId: subCategoryId ? parseInt(subCategoryId) : null,
      },
    });

    res.json(product);
  }),
];

// @desc Delete product
// @route DELETE /api/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  await prisma.product.delete({
    where: { id: +req.params.id },
  });

  res.json({ message: 'Product deleted!' });
});
