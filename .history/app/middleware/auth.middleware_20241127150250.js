import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { UserFields } from '../utils/user.utils.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Проверяем, есть ли токен в заголовке Authorization
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Проверяем, есть ли токен в куках
  if (!token && req.cookies?.authToken) {
    token = req.cookies.authToken;
  }

  // Если токен отсутствует
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Находим пользователя по ID из токена
    const userFound = await prisma.user.findUnique({
      where: {
        id: decoded.id, // Используем `id` из payload токена
      },
      select: UserFields,
    });

    if (!userFound) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    req.user = userFound;
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});
