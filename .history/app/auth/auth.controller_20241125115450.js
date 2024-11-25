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

  // Ищем пользователя по логину
  const user = await prisma.user.findUnique({
    where: {
      login,
    },
  });

  if (!user) {
    res.status(401);
    throw new Error('Invalid login or password');
  }

  // Проверяем правильность пароля
  const isValidPassword = await verify(user.password, password);

  if (isValidPassword) {
    // Генерируем токен
    const token = generateToken(user.id);

    // Возвращаем токен и роль
    res.json({
      token,
      role: user.role, // Возвращаем роль пользователя
    });
  } else {
    res.status(401);
    throw new Error('Invalid login or password');
  }
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { login, email, password } = req.body;

  const isHaveUser = await prisma.user.findUnique({
    where: {
      login,
    },
  });

  if (isHaveUser) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await prisma.user.create({
    data: {
      login,
      email,
      password: await hash(password),
      name: faker.name.fullName(),
    },
    select: UserFields,
  });

  const token = generateToken(user.id);

  res.json({ user, token });
});
