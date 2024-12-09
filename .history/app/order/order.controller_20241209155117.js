import asyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';
import { prisma } from '../prisma.js';

// Настройка Nodemailer для Mail.ru
const transporter = nodemailer.createTransport({
  host: 'smtp.mail.ru',
  port: 465,
  secure: true,
  auth: {
    user: 'adamej10@bk.ru',
    pass: 'JvmdCqAaMZD0fwdVHAWQ',
  },
});

// Создание нового заказа
export const createOrder = asyncHandler(async (req, res) => {
  try {
    const { items, total, adress, paymentMethod, name, phone, email } =
      req.body;

    // Проверка обязательных данных
    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('Нет товаров в заказе');
    }
    if (!adress || adress.trim() === '') {
      res.status(400);
      throw new Error('Адрес обязателен');
    }
    if (!paymentMethod) {
      res.status(400);
      throw new Error('Не выбран способ оплаты');
    }

    const userId = req.user.id;

    const newOrder = await prisma.order.create({
      data: {
        userId,
        total,
        adress,
        email,
        name,
        phone,
        paymentMethod,
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
        (item) =>
          `<li>${item.product.name} - ${item.quantity}шт x ${item.price} ₽</li>`
      )
      .join('');

    const emailContent = `
      <h2>Новый заказ от покупателя</h2>
      <p>Имя: ${name}</p>
      <p>Email: ${email}</p>
      <p>Телефон: ${phone}</p>
      <p>Адрес: ${adress}</p>
      <p>Общая сумма: ${total} ₽</p>
      <p>Способ оплаты: ${paymentMethod}</p>
      <h3>Товары в заказе:</h3>
      <ul>${orderItemsList}</ul>
    `;

    // Отправка email с деталями заказа
    try {
      await transporter.sendMail({
        from: 'adamej10@bk.ru',
        to: 'adamej10@bk.ru',
        subject: 'Новый заказ',
        html: emailContent,
      });
    } catch (error) {
      console.error('Ошибка при отправке email:', error);
    }

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    res.status(500).json({ message: 'Ошибка при создании заказа' });
  }
});

// Получение всех заказов
export const getOrders = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    const totalOrders = await prisma.order.count();
    const orders = await prisma.order.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    });

    console.log(orders);

    res.set(
      'Content-Range',
      `orders ${(page - 1) * perPage}-${page * perPage - 1}/${totalOrders}`
    );
    res.status(200).json(orders);
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    res.status(500).json({ message: 'Ошибка при получении заказов' });
  }
});

// Получение конкретного заказа по ID
export const getOrder = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findFirst({
      where: { id: parseInt(orderId) },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Ошибка при получении заказа:', error);
    res.status(500).json({ message: 'Ошибка при получении заказа' });
  }
});

export const updateOrder = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items, total, adress, paymentMethod, name, phone, email } =
      req.body;

    // Проверка обязательных данных
    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('Нет товаров в заказе');
    }
    if (!adress || adress.trim() === '') {
      res.status(400);
      throw new Error('Адрес обязателен');
    }
    if (!paymentMethod) {
      res.status(400);
      throw new Error('Не выбран способ оплаты');
    }

    // Находим заказ по ID
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { orderItems: true },
    });

    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    // Обновление заказа в базе данных
    const updateOrder = asyncHandler(async (req, res) => {
      try {
        const { orderId } = req.params;
        const { items, total, adress, paymentMethod, name, phone, email } =
          req.body;

        // Проверка обязательных данных
        if (!items || items.length === 0) {
          res.status(400);
          throw new Error('Нет товаров в заказе');
        }
        if (!adress || adress.trim() === '') {
          res.status(400);
          throw new Error('Адрес обязателен');
        }
        if (!paymentMethod) {
          res.status(400);
          throw new Error('Не выбран способ оплаты');
        }

        // Находим заказ по ID
        const order = await prisma.order.findUnique({
          where: { id: parseInt(orderId) },
          include: { orderItems: true },
        });

        if (!order) {
          return res.status(404).json({ message: 'Заказ не найден' });
        }

        // Удаляем товары, которых нет в новом заказе
        const existingProductIds = order.orderItems.map(
          (item) => item.productId
        );
        const newProductIds = items.map((item) => item.productId);

        const productsToDelete = existingProductIds.filter(
          (productId) => !newProductIds.includes(productId)
        );

        if (productsToDelete.length > 0) {
          await prisma.orderItem.deleteMany({
            where: {
              orderId: parseInt(orderId),
              productId: { in: productsToDelete },
            },
          });
        }

        // Обновляем количество для существующих товаров или добавляем новые товары
        for (const item of items) {
          const existingItem = order.orderItems.find(
            (orderItem) => orderItem.productId === item.productId
          );

          if (existingItem) {
            // Если товар существует, обновляем его количество и цену
            await prisma.orderItem.update({
              where: { id: existingItem.id },
              data: {
                quantity: item.quantity,
                price: item.price,
              },
            });
          } else {
            // Если товар новый, добавляем его в заказ
            await prisma.orderItem.create({
              data: {
                orderId: parseInt(orderId),
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              },
            });
          }
        }

        // Обновляем сам заказ (например, общая сумма и другие данные)
        const updatedOrder = await prisma.order.update({
          where: { id: parseInt(orderId) },
          data: {
            total,
            adress,
            email,
            name,
            phone,
            paymentMethod,
          },
          include: {
            orderItems: {
              include: { product: true },
            },
          },
        });

        // Отправляем обновленный заказ в ответ
        res.status(200).json(updatedOrder);
      } catch (error) {
        console.error('Ошибка при обновлении заказа:', error);
        res.status(500).json({ message: 'Ошибка при обновлении заказа' });
      }
    });

    // Формирование содержимого письма с обновлениями заказа
    const orderItemsList = updatedOrder.orderItems
      .map(
        (item) =>
          `<li>${item.product.name} - ${item.quantity}шт x ${item.price} ₽</li>`
      )
      .join('');

    const emailContent = `
      <h2>Обновление заказа от покупателя</h2>
      <p>Имя: ${name}</p>
      <p>Email: ${email}</p>
      <p>Телефон: ${phone}</p>
      <p>Адрес: ${adress}</p>
      <p>Общая сумма: ${total} ₽</p>
      <p>Способ оплаты: ${paymentMethod}</p>
      <h3>Товары в заказе:</h3>
      <ul>${orderItemsList}</ul>
    `;

    // Отправка email с обновлениями
    try {
      await transporter.sendMail({
        from: 'adamej10@bk.ru',
        to: 'adamej10@bk.ru',
        subject: 'Обновление заказа',
        html: emailContent,
      });
    } catch (error) {
      console.error('Ошибка при отправке email:', error);
    }

    // Отправляем обновленный заказ в ответ
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Ошибка при обновлении заказа:', error);
    res.status(500).json({ message: 'Ошибка при обновлении заказа' });
  }
});

export const deleteOrder = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;

    // Находим заказ по ID
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { orderItems: true }, // Для проверки, что заказ существует
    });

    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    // Удаляем все товары из заказа
    await prisma.orderItem.deleteMany({
      where: { orderId: parseInt(orderId) },
    });

    // Удаляем сам заказ
    await prisma.order.delete({
      where: { id: parseInt(orderId) },
    });

    res.status(200).json({ message: 'Заказ успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении заказа:', error);
    res.status(500).json({ message: 'Ошибка при удалении заказа' });
  }
});

module.exports = {
  updateOrder,
};
