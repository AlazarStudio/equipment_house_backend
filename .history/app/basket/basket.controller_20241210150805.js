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
          product: true,
        },
      },
    },
  });

  if (!basket) {
    return res.json({ basketItems: [] });
  }

  res.json(basket);
});

// @desc    Add product to basket
// @route   POST /api/basket
// @access  Private
export const addToBasket = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity = 1 } = req.body;

  if (!Number.isInteger(quantity) || quantity < 1) {
    res.status(400);
    throw new Error('Invalid quantity');
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let basket = await prisma.basket.findFirst({ where: { userId } });

  if (!basket) {
    basket = await prisma.basket.create({ data: { userId } });
  }

  const basketItem = await prisma.basketItem.findFirst({
    where: {
      basketId: basket.id,
      productId,
    },
  });

  if (basketItem) {
    const updatedBasketItem = await prisma.basketItem.update({
      where: { id: basketItem.id },
      data: { quantity: basketItem.quantity + quantity },
    });
    return res.json(updatedBasketItem);
  }

  const newBasketItem = await prisma.basketItem.create({
    data: {
      basketId: basket.id,
      productId,
      quantity,
      price: product.price,
    },
  });

  res.status(201).json(newBasketItem);
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

  await prisma.basketItem.delete({ where: { id: +itemId } });

  res.json({ message: 'Item removed from basket' });
});

// @desc    Update quantity of product in basket
// @route   PUT /api/basket/:itemId
// @access  Private
// @desc    Update quantity of product in basket
// @route   PUT /api/basket/:itemId
// @access  Private
export const updateBasketItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!Number.isInteger(quantity) || quantity <= 0) {
    res.status(400);
    throw new Error('Invalid quantity');
  }

  const basketItem = await prisma.basketItem.findUnique({ where: { id: +itemId } });

  if (!basketItem) {
    res.status(404);
    throw new Error('Basket item not found');
  }

  if (quantity === 0) {
    await prisma.basketItem.delete({ where: { id: +itemId } });
    return res.json({ message: 'Item removed from basket due to quantity 0' });
  }

  const updatedBasketItem = await prisma.basketItem.update({
    where: { id: +itemId },
    data: { quantity },
  });

  res.json(updatedBasketItem);
});

// @desc    Get the total count of items in the user's basket
// @route   GET /api/cart/count
// @access  Private
export const getCartCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const basket = await prisma.basket.findFirst({
    where: { userId },
    include: {
      basketItems: true,
    },
  });

  // Если корзина пуста, возвращаем 0
  if (!basket) {
    return res.json({ count: 0 });
  }

  // Считаем количество товаров в корзине
  const totalCount = basket.basketItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  res.json({ count: totalCount });
});
