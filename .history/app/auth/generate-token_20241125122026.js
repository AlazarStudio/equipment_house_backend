import jwt from 'jsonwebtoken';

/**
 * Генерация JWT токена
 * @param {number|string} userId - ID пользователя
 * @param {string} role - Роль пользователя (опционально)
 * @returns {string} - Сгенерированный токен
 */
export const generateToken = (userId, role = 'USER') => {
  try {
    return jwt.sign(
      {
        userId,
        role, // Включаем роль в токен
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '5d', // Срок действия токена ()
      }
    );
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Token generation failed');
  }
};
