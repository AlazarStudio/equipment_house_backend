import asyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';
import { prisma } from '../prisma.js';

// Настройка Nodemailer для Mail.ru
const transporter = nodemailer.createTransport({
  host: 'smtp.mail.ru', // Используем SMTP сервер Mail.ru
  port: 465, // Порт для SSL
  secure: true, // Используем SSL
  auth: {
    user: 'adamej10@bk.ru', // Ваш email
    pass: 'JvmdCqAaMZD0fwdVHAWQ', // Ваш пароль (или пароль для приложения, если включена двухфакторная аутентификация)
  },
});

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  try {
    console.log(req.body); // Логирование данных, которые приходят на сервер

    const { items, total, adress, paymentMethod, name, phone, email } =
      req.body;

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
    console.log(req.body);
    // Создание заказа в базе данных
    const newOrder = await prisma.order.create({
      data: {
        userId,
        total,
        adress,
        email,
        name,
        phone,
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
      <li>${item.product.name} - ${item.quantity}шт x ${item.price} ₽</li>
    `
      )
      .join('');

    const emailContent = `
      <h2>Новый заказ от покупателя</h2>
      <p>Имя:${name}</p>
      <p>Email: ${email}</p>\
      <p>Телефон: ${phone}</p>
      <p>Адрес: ${adress}</p>
      <p>Общая сумма: ${total} ₽</p>
      <p> Способ оплаты: ${paymentMethod}</p>
      <h3>Товары в заказе:</h3>
      <ul>
        ${orderItemsList}
      </ul>
    `;

    // Отправка email с деталями заказа
    try {
      await transporter.sendMail({
        from: 'adamej10@bk.ru', // Ваш email
        to: 'adamej10@bk.ru', // Ваш email, на который отправляется заказ
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

// @desc    Get all orders (without filtering by user)
// @route   GET /api/orders
// @access  Private (for admins or authorized users)
export const getOrders = asyncHandler(async (req, res) => {
  try {
    // Получаем все заказы из базы данных
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    });

    // Если заказы не найдены, отправляем 404
    if (!orders || orders.length === 0) {
      res.status(404);
      throw new Error('No orders found');
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    res.status(500).json({ message: 'Произошла ошибка при получении заказов' });
  }
});

// @desc    Get a specific order by ID (without filtering by user)
// @route   GET /api/orders/:id
// @access  Private (for admins or authorized users)
export const getOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Получаем заказ по ID (без фильтрации по пользователю)
    const order = await prisma.order.findFirst({
      where: { id },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    });

    // Если заказ не найден, отправляем 404
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Ошибка при получении заказа:', error);
    res.status(500).json({ message: 'Произошла ошибка при получении заказа' });
  }
});
