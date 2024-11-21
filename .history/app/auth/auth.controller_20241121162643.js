import { faker } from '@faker-js/faker';
import { hash, verify } from 'argon2';
import asyncHandler from 'express-async-handler';

import { prisma } from '../prisma.js';
import { UserFields } from '../utils/user.utils.js';

import { generateToken } from './generate-token.js';

// @desc    Auth user
// @route   POST /api/auth/login
// @access  Public
export const authUser = asyncHandler(async (req, res) => {
  const { login, password } = req.body;

  // Проверка на наличие данных
  if (!login || !password) {
    res.status(400);
    throw new Error('Please provide login and password');
  }

  try {
    const user = await prisma.user.findUnique({
      where: { login },
    });

    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    const isValidPassword = await verify(user.password, password);

    if (!isValidPassword) {
      res.status(401);
      throw new Error('Invalid password');
    }

    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        login: user.login,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error('Error in authUser:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { login, email, password } = req.body;

  // Проверка на наличие данных
  if (!login || !email || !password) {
    res.status(400);
    throw new Error('Please provide login, email, and password');
  }

  try {
    // Проверка, существует ли пользователь
    const isLoginExists = await prisma.user.findUnique({
      where: { login },
    });

    if (isLoginExists) {
      res.status(400);
      throw new Error('Login already exists');
    }

    const isEmailExists = await prisma.user.findUnique({
      where: { email },
    });

    if (isEmailExists) {
      res.status(400);
      throw new Error('Email already exists');
    }

    // Создание нового пользователя
    const user = await prisma.user.create({
      data: {
        login,
        email,
        password: await hash(password), // Хэширование пароля
        name: faker.name.fullName(),    // Генерация имени
      },
      select: UserFields, // Выбор только необходимых полей
    });

    const token = generateToken(user.id);

    res.json({
      user,
      token,
    });
  } catch (error) {
    console.error('Error in registerUser:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});
