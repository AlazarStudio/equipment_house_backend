import asyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';
import { prisma } from '../prisma.js';

// Настройка Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Используем Gmail (или любой другой почтовый сервис)
  auth: {
    user: 'adamej10@gmail.com', // Ваш email (из переменных окружения)
    pass: 'Gonov1997', // Ваш пароль (или пароль для приложения)
  },
});

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  try {
    console.log(req.body); // Логирование данных, которые приходят на сервер

    const { items, total, adress, paymentMethod, name, phone, email } = req.body;

    // Проверка обязательных данных
    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('No items in the order');
    }
    if (!adress || adress.trim() === '') {
      res.status(400);
      throw new Error('Address is required');
    }
    if (!paymentMethod) {
      res.status(400);
      throw new Error('Payment method is required');
    }

    // Извлечение данных пользователя
    const userId = req.user.id;
    
    // Создание заказа в базе данных
    const newOrder = await prisma.order.create({
      data: {
        userId,
        total,
        adress,
        email,
        name,
        paymentMethod, // Способ оплаты
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

    // Формирование содержимого письма с деталями заказа
    const orderItemsList = newOrder.orderItems
      .map(
        (item) => `
      <li>${item.product.name} - ${item.quantity} x ${item.price} ₽</li>
    `
      )
      .join('');

    const emailContent = `
      <h2>Новый заказ от пользователя ${name}</h2>
      <p>Email: ${email}</p>
      <p>Адрес: ${adress}</p>
      <p>Общая сумма: ${total} ₽</p>
      <h3>Товары в заказе:</h3>
      <ul>
        ${orderItemsList}
      </ul>
    `;

    // Отправка email с деталями заказа
    try {
      await transporter.sendMail({
        from: 'adamej10@bk', // Ваш email
        to: 'adamej10@gmail.com', // Ваш email
        subject: 'Новый заказ',
        html: emailContent,
      });
      console.log('Email отправлен');
    } catch (error) {
      console.error('Ошибка при отправке email:', error);
    }

    // Отправляем ответ с созданным заказом
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Ошибка при создании заказа:', error); // Логируем ошибку
    res.status(500).json({ message: 'Произошла ошибка при создании заказа' });
  }
});

