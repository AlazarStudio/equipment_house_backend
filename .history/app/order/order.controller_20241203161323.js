import asyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';
import { prisma } from '../prisma.js';

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { items, total } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No items in the order');
  }

  const newOrder = await prisma.order.create({
    data: {
      userId,
      total,
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

  // Отправка письма магазину
  await sendOrderEmail(newOrder);

  res.status(201).json(newOrder);
});

// @desc    Get user's orders
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

// Функция для отправки письма с заказом
const sendOrderEmail = async (order) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Используйте ваш почтовый сервис
    auth: {
      user: process.env.EMAIL_USER, // Почта магазина
      pass: process.env.EMAIL_PASS, // Пароль приложения
    },
  });

  const orderDetails = order.orderItems
    .map(
      (item) =>
        `Название: ${item.product.name}, Количество: ${item.quantity}, Цена: ${item.price} ₽`
    )
    .join('\n');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'store-email@gmail.com', // Почта магазина
    subject: `Новый заказ от пользователя ${order.userId}`,
    text: `
      Новый заказ:
      ${orderDetails}
      Итого: ${order.total} ₽
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
