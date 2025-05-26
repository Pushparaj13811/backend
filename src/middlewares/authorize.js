import { AppError } from '../utils/errors/AppError.js';

/**
 * Middleware to authorize users based on their roles
 * @param {string[]} roles - Array of allowed roles
 * @returns {Function} Express middleware function
 */
export const authorize = (roles = []) => {
  return (req, res, next) => {
    try {
      // Check if user exists (should be set by authenticate middleware)
      if (!req.user) {
        return next(new AppError('User not authenticated', 401));
      }

      // If roles array is empty, allow all authenticated users
      if (roles.length === 0) {
        return next();
      }

      // Check if user's role is in the allowed roles array
      if (!roles.includes(req.user.role)) {
        return next(
          new AppError('You do not have permission to perform this action', 403)
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}; 