export const generateToken = (userId, email, name, role = 'USER') => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    // console.log('Generating token with:', { userId, email, name, role });

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
