export const generateToken = (userId, name, email, role = 'USER') => {
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
