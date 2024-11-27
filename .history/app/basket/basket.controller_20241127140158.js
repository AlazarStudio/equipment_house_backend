import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get user's basket
// @route   GET /api/basket
// @access  Private
export const getBasket = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const basket = await prisma.basket.findFirst({
    where: { userId },
    include: {
      basketItems: {
        include: {
          product: true, // Включаем данные о продукте
        },
      },
    },
  });

  if (!basket) {
    res.status(404);
    throw new Error('Basket not found');
  }

  res.json(basket);
});

// @desc    Add product to basket
// @route   POST /api/basket
// @access  Private
export const addToBasket = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  // Проверяем, существует ли продукт
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Проверяем, существует ли корзина пользователя
  let basket = await prisma.basket.findFirst({
    where: { userId },
  });

  if (!basket) {
    // Создаем корзину, если она не существует
    basket = await prisma.basket.create({
      data: { userId },
    });
  }

  // Проверяем, существует ли товар в корзине
  const basketItem = await prisma.basketItem.findFirst({
    where: {
      basketId: basket.id,
      productId,
    },
  });

  if (basketItem) {
    // Обновляем количество, если товар уже в корзине
    const updatedBasketItem = await prisma.basketItem.update({
      where: { id: basketItem.id },
      data: {
        quantity: basketItem.quantity + quantity,
      },
    });

    res.json(updatedBasketItem);
  } else {
    // Добавляем новый товар в корзину
    const newBasketItem = await prisma.basketItem.create({
      data: {
        basketId: basket.id,
        productId,
        quantity,
        price: product.price,
      },
    });

    res.status(201).json(newBasketItem);
  }
});

// @desc    Remove product from basket
// @route   DELETE /api/basket/:itemId
// @access  Private
export const removeFromBasket = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const basketItem = await prisma.basketItem.findUnique({
    where: { id: +itemId },
  });

  if (!basketItem) {
    res.status(404);
    throw new Error('Basket item not found');
  }

  await prisma.basketItem.delete({
    where: { id: +itemId },
  });

  res.json({ message: 'Item removed from basket' });
});

// @desc    Update quantity of product in basket
// @route   PUT /api/basket/:itemId
// @access  Private
export const updateBasketItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  const basketItem = await prisma.basketItem.findUnique({
    where: { id: +itemId },
  });

  if (!basketItem) {
    res.status(404);
    throw new Error('Basket item not found');
  }

  if (quantity <= 0) {
    // Удаляем товар из корзины, если количество меньше или равно нулю
    await prisma.basketItem.delete({
      where: { id: +itemId },
    });

    res.json({ message: 'Item removed from basket due to quantity 0' });
  } else {
    // Обновляем количество товара
    const updatedBasketItem = await prisma.basketItem.update({
      where: { id: +itemId },
      data: { quantity },
    });

    res.json(updatedBasketItem);
  }
});
