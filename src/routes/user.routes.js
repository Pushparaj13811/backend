import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { validateRequest } from '../middlewares/validate-request.js';
import { registerSchema, loginSchema } from '../validations/user.validation.js';
import { authenticate } from '../middlewares/authenticate.js';
import {
  authLimiter,
  registerLimiter,
  verifyEmailLimiter,
  refreshTokenLimiter,
  generalLimiter
} from '../utils/rate-limiter.js';

const router = Router();
const userController = new UserController();

// Apply general rate limiter to all routes
router.use(generalLimiter);

// Public routes
router.post(
  '/register',
  registerLimiter,
  validateRequest(registerSchema),
  userController.register
);

router.post(
  '/login',
  authLimiter,
  validateRequest(loginSchema),
  userController.login
);

router.get(
  '/verify-email/:token',
  verifyEmailLimiter,
  userController.verifyEmail
);

router.post(
  '/refresh-token',
  refreshTokenLimiter,
  userController.refreshToken
);

// Protected routes
router.post(
  '/logout',
  authenticate,
  userController.logout
);

export default router; 