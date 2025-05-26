import express from 'express';
import { UserController } from '../controllers/UserController.js';
import { validateRequest } from '../middlewares/validate-request.js';
import { userValidation } from '../validations/user.validation.js';
import { authenticate } from '../middlewares/authenticate.js';
import {
  authLimiter,
  registerLimiter,
  verifyEmailLimiter,
  refreshTokenLimiter,
  generalLimiter
} from '../utils/rate-limiter.js';

const router = express.Router();
const userController = new UserController();

// Apply general rate limiter to all routes
router.use(generalLimiter);

// Public routes
router.post(
  '/register',
  registerLimiter,
  validateRequest(userValidation.register),
  userController.register
);

router.post(
  '/verify/email',
  validateRequest(userValidation.verifyEmailOTP),
  userController.verifyEmailOTP
);

router.post(
  '/verify/phone',
  validateRequest(userValidation.verifyPhoneOTP),
  userController.verifyPhoneOTP
);

router.post(
  '/resend-otp',
  validateRequest(userValidation.resendOTP),
  userController.resendVerificationOTP
);

router.post(
  '/login',
  authLimiter,
  validateRequest(userValidation.login),
  userController.login
);

router.post(
  '/refresh-token',
  refreshTokenLimiter,
  validateRequest(userValidation.refreshToken),
  userController.refreshToken
);

// Protected routes
router.use(authenticate);

router.post(
  '/resend-otp/authenticated',
  validateRequest(userValidation.resendOTPAuthenticated),
  userController.resendVerificationOTP
);

router.post('/logout', userController.logout);

router.get('/profile', userController.getProfile);

router.patch(
  '/profile',
  validateRequest(userValidation.updateProfile),
  userController.updateProfile
);

router.put(
  '/profile',
  validateRequest(userValidation.updateProfile),
  userController.updateProfile
);

router.patch(
  '/change-password',
  validateRequest(userValidation.changePassword),
  userController.changePassword
);

export default router; 