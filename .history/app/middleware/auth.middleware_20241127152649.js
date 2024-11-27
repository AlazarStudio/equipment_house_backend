import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { UserFields } from '../utils/user.utils.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token && req.cookies?.authToken) {
    token = req.cookies.authToken;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userFound = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
