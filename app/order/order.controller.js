import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { items, total, adress } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No items in the order');
  }

  if (!adress || adress.trim() === '') {
    res.status(400);
    throw new Error('Address is required');
  }

  const newOrder = await prisma.order.create({
    data: {
      userId,
      total,
      adress,
      orderItems: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: {
      orderItems: {
        include: { product: true },
      },
    },
  });

  res.status(201).json(newOrder);
});

// @desc    Get all orders for the user
// @route   GET /api/orders
// @access  Private
export const getOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      orderItems: {
        include: { product: true },
      },
    },
  });

  res.json(orders);
});

// @desc    Update an order
// @route   PUT /api/orders/:orderId
// @access  Private
export const updateOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { adress, items } = req.body;

  const existingOrder = await prisma.order.findUnique({
    where: { id: Number(orderId) },
    include: { orderItems: true },
  });

  if (!existingOrder) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (existingOrder.userId !== req.user.id) {
    res.status(403);
    throw new Error('You do not have permission to edit this order');
  }

  const updatedOrder = await prisma.order.update({
    where: { id: Number(orderId) },
    data: {
      adress: adress || existingOrder.adress,
      orderItems: items
        ? {
            deleteMany: {}, // Удалить старые элементы заказа
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          }
        : undefined,
    },
    include: { orderItems: true },
  });

  res.json(updatedOrder);
});

// @desc    Delete an order
// @route   DELETE /api/orders/:orderId
// @access  Private
export const deleteOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const existingOrder = await prisma.order.findUnique({
    where: { id: Number(orderId) },
  });

  if (!existingOrder) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (existingOrder.userId !== req.user.id) {
    res.status(403);
    throw new Error('You do not have permission to delete this order');
  }

  await prisma.order.delete({
    where: { id: Number(orderId) },
  });

  res.json({ message: 'Order deleted successfully' });
});
