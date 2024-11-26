import jwt from 'jsonwebtoken';

/**
 * Генерация JWT токена
 * @param {number|string} userId - ID пользователя
 * @param {string} email
 * @param {string} name
 * @param {string} role
 * @returns {string} - Сгенерированный токен
 */
export const generateToken = (userId, email, name, role = 'USER') => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.sign(
      {
        userId,
        name,
        email,
        role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '5d' }
    );
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Token generation failed');
  }
};
