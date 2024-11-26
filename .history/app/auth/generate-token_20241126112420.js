import jwt from 'jsonwebtoken';

/**
 * Генерация JWT токена
 * @param {number|string} userId - ID пользователя
 * @param {string} role
 * @param {string} email
 * @param {string} name
 * @returns {string} - Сгенерированный токен
 */
export const generateToken = (userId,email role = 'USER') => {
  try {
    return jwt.sign(
      {
        userId,
        name,
        email,
        role, // Включаем роль в токен
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '5d', // Срок действия токена (5 дней)
      }
    );
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Token generation failed');
  }
};
