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

  // Генерируем токен
  const token = generateToken(user.id, user.email, user.name, user.role);

  // Устанавливаем токен в куку
  res.cookie('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  // Возвращаем токен и данные пользователя
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { login, email, password, name, role = 'USER' } = req.body;

  // Проверяем, существует ли пользователь с таким логином
  const isHaveUser = await prisma.user.findUnique({
    where: {
      login,
    },
  });

  if (isHaveUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  // Проверяем, существует ли пользователь с таким email
  const isEmailTaken = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (isEmailTaken) {
    return res.status(400).json({ error: 'Email is already registered' });
  }

  // Проверяем наличие имени
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }

  // Создаем нового пользователя
  const user = await prisma.user.create({
    data: {
      login,
      email,
      password: await hash(password), // Хешируем пароль
      name,
      role, // Устанавливаем роль (по умолчанию "USER")
    },
  });

  // Генерируем токен
  const token = generateToken(user.id, user.email, user.name, user.role);

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
