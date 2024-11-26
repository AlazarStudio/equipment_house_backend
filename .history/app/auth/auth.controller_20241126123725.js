import { faker } from '@faker-js/faker';
import { hash, verify } from 'argon2';
import asyncHandler from 'express-async-handler';

import { prisma } from '../prisma.js';
import { generateToken } from './generate-token.js';

// @desc    Auth user
// @route   POST /api/auth/login
// @access  Public
export const authUser = asyncHandler(async (req, res) => {
  const { login, password } = req.body;

  // Проверяем наличие пользователя
  const user = await prisma.user.findUnique({
    where: { login },
  });

  if (!user) {
    return res.status(401).json({ error: 'Invalid login or password' });
  }

  // Проверяем правильность пароля
  const isValidPassword = await verify(user.password, password);

  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid login or password' });
  }

  // Генерируем токен с полными данными
  const token = generateToken(user.id, user.email, user.name, user.role);

  // Возвращаем токен и данные пользователя
  res.json({
    token,
    user: {
      id: user.id,
      login: user.login,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { login, email, password, role = 'USER' } = req.body;

  // Проверяем, существует ли пользователь с таким логином или email
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ login }, { email }],
    },
  });

  if (existingUser) {
    if (existingUser.login === login) {
      return res.status(400).json({ error: 'User already exists' });
    }
    if (existingUser.email === email) {
      return res.status(400).json({ error: 'Email is already registered' });
    }
  }

  // Создаем нового пользователя
  const user = await prisma.user.create({
    data: {
      login,
      email,
      password: await hash(password), // Хешируем пароль
      name: faker.name.fullName(), // Генерируем случайное имя
      role, // Устанавливаем роль (по умолчанию "USER")
    },
  });

  // Генерируем токен с полными данными
  const token = generateToken(user.id, user.email, user.name, user.role);

  // Возвращаем данные пользователя и токен
  res.json({
    user: {
      id: user.id,
      login: user.login,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  });
});
