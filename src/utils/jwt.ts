import jwt from 'jsonwebtoken';

export const signToken = (payload: object, options?: jwt.SignOptions): string => {
  return jwt.sign(payload, process.env.AUTH_SECRET || 'secret', options);
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.AUTH_SECRET || 'secret');
};
