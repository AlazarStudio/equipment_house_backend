import asyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';
import { prisma } from '../prisma.js';
import { getMaxListeners } from 'nodemailer/lib/xoauth2/index.js';

// Настройка Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Используем Gmail (или любой другой почтовый сервис)
  auth: {
    user: 'adamej10@gmail.com', // Ваш email (из переменных окружения)
    pass: process.env.EMAIL_PASS, // Ваш пароль (или пароль для приложения)
  },
});

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { items, total, adress } = req.body;

  // Извлекаем данные пользователя из куки
  const { name } = req.user; // Предполагаем, что имя хранится в объекте user
  const { phone } = req.user; // Предполагаем, что телефон хранится в объекте user
  const { email } = req.user; // Предполагаем, что email хранится в объекте user

  // Проверяем, есть ли товары в заказе
  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No items in the order');
  }

  // Проверяем, заполнен ли адрес
  if (!adress || adress.trim() === '') {
    res.status(400);
    throw new Error('Address is required');
  }

  // Создаем заказ в базе данных
  const newOrder = await prisma.order.create({
    data: {
      userId,
      total,
      adress,
      email, // Сохраняем email
      name, // Сохраняем имя
      phone, // Сохраняем телефон
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

  // Формируем содержимое письма с деталями заказа
  const orderItemsList = newOrder.orderItems
    .map(
      (item) => `
    <li>${item.product.name} - ${item.quantity} x ${item.price} ₽</li>
  `
    )
    .join('');

  const emailContent = `
    <h2>Новый заказ от пользователя ${name}</h2>
    <p>Телефон: ${phone}</p>
    <p>Email: ${email}</p>
    <p>Адрес: ${adress}</p>
    <p>Общая сумма: ${total} ₽</p>
    <h3>Товары в заказе:</h3>
    <ul>
      ${orderItemsList}
    </ul>
  `;

  // Отправляем письмо с деталями заказа на ваш email
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER, // Ваш email
      to: 'your-email@example.com', // Ваш email (на который отправляется заказ)
      subject: 'Новый заказ',
      html: emailContent,
    });
    console.log('Email отправлен');
  } catch (error) {
    console.error('Ошибка при отправке email:', error);
  }

  // Отправляем ответ с созданным заказом
  res.status(201).json(newOrder);
});
