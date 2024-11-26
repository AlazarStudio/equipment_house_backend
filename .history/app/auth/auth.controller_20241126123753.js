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
    where: {
      login,
    },
  });

  if (!user) {
    res.status(401).json({ error: 'Invalid login or password' });
    return;
  }

  // Проверяем правильность пароля
  const isValidPassword = await verify(user.password, password);

  if (!isValidPassword) {
    res.status(401).json({ error: 'Invalid login or password' });
    return;
  }

  // Генерируем токен
  const token = generateToken(user.id);

  // Возвращаем токен и роль
  res.json({
    token,
    role: user.role,
  });
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { login, email, password, role = 'USER' } = req.body;

  // Проверяем, существует ли пользователь с таким логином
  const isHaveUser = await prisma.user.findUnique({
    where: {
      login,
    },
  });

  if (isHaveUser) {
    res.status(400).json({ error: 'User already exists' });
    return;
  }

  // Проверяем, существует ли пользователь с таким email
  const isEmailTaken = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (isEmailTaken) {
    res.status(400).json({ error: 'Email is already registered' });
    return;
  }

  // Создаем нового пользователя
  const user = await prisma.user.create({
    data: {
      login,
      email,
      password: await hash(password), // Хешируем пароль
      name, // Генерируем случайное имя
      role, // Устанавливаем роль (по умолчанию "USER")
    },
  });

  // Генерируем токен
  const token = generateToken(user.id);

  // Возвращаем данные пользователя и токен
  res.json({
    user: {
      id: user.id,
      login: user.login,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    token,
  });
});
