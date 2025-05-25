import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors/AppError.js';
import { UserRepository } from '../repositories/UserRepository.js';
import env from '../config/env.js';

const userRepository = new UserRepository();

export const authenticate = async (req, res, next) => {
  try {
    // 1) Get token from header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Please log in to access this resource', 401));
    }

    // 2) Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // 3) Check if user still exists
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return next(
        new AppError('The user belonging to this token no longer exists', 401)
      );
    }

    // 4) Check if user changed password after the token was issued
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(
        user.passwordChangedAt.getTime() / 1000,
        10
      );
      if (decoded.iat < changedTimestamp) {
        return next(
          new AppError('User recently changed password! Please log in again', 401)
        );
      }
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Invalid token. Please log in again', 401));
  }
}; 