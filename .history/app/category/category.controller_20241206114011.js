import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// Получить все категории с пагинацией, сортировкой и фильтрацией
export const getCategories = asyncHandler(async (req, res) => {
  try {
    const { range, sort, filter } = req.query;

    const rangeStart = range ? JSON.parse(range)[0] : 0;
    const rangeEnd = range ? JSON.parse(range)[1] : 100;

    const sortField = sort ? JSON.parse(sort)[0] : 'createdAt';
    const sortOrder = sort ? JSON.parse(sort)[1].toLowerCase() : 'desc';

    const filters = filter ? JSON.parse(filter) : {};
    
    const where = Object.keys(filters).reduce((acc, field) => {
      const value = filters[field];
      if (Array.isArray(value)) {
        acc[field] = { in: value };
      } else if (typeof value === 'string') {
        acc[field] = { contains: value, mode: 'insensitive' };
      } else {
        acc[field] = { equals: value };
      }
      return acc;
    }, {});

    const totalCategories = await prisma.category.count({ where });

    const categories = await prisma.category.findMany({
      where,
      skip: rangeStart,
      take: rangeEnd - rangeStart + 1,
      orderBy: { [sortField]: sortOrder },
      include: { products: true },
    });

    res.set('Content-Range', `categories ${rangeStart}-${Math.min(rangeEnd, totalCategories - 1)}/${totalCategories}`);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
});

// Получить категорию по ID
export const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await prisma.category.findUnique({
    where: { id: parseInt(id, 10) },
  });

  if (!category) {
    return res.status(404).json({ error: 'Category not found!' });
  }

  res.json(category);
});

// Создать новую категорию
export const createNewCategory = asyncHandler(async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  let imgPath = '';
  if (req.file) {
    imgPath = `/uploads/images/${req.file.filename}`; // Сохраняем путь к изображению
  }

  const category = await prisma.category.create({
    data: {
      title,
      img: imgPath, // Сохраняем путь изображения
    },
  });

  res.status(201).json(category);
});

// Обновить категорию
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required for update' });
  }

  try {
    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id, 10) },
      data: { title },
    });

    res.json(updatedCategory);
  } catch (error) {
    res.status(404).json({ error: 'Category not found!' });
  }
});

// Удалить категорию
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.category.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({ message: 'Category deleted successfully!' });
  } catch (error) {
    res.status(404).json({ error: 'Category not found!' });
  }
});
