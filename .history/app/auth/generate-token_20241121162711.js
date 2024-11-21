// import jwt from 'jsonwebtoken'

// export const generateToken = userId =>
// 	jwt.sign(
// 		{
// 			userId
// 		},
// 		process.env.JWT_SECRET,
// 		{
// 			expiresIn: '10d'
// 		}
// 	)

import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};
