import asyncHandler from 'express-async-handler';
import { UserService } from '../services/UserService.js';
import { UserRepository } from '../repositories/UserRepository.js';

export class UserController {
  constructor() {
    const userRepository = new UserRepository();
    this.userService = new UserService(userRepository);
  }

  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  register = asyncHandler(async (req, res, next) => {
    try {
      const { email, phone, ...userData } = req.body;
      const result = await this.userService.register({ email, phone, ...userData });

      res.status(201).json({
        success: true,
        data: {
          message: 'Registration successful. Please verify your email and phone.',
          userId: result.userId
        }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Verify email OTP
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  verifyEmailOTP = asyncHandler(async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      await this.userService.verifyEmailOTP(email, otp);

      res.status(200).json({
        success: true,
        data: {
          message: 'Email verified successfully'
        }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Verify phone OTP
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  verifyPhoneOTP = asyncHandler(async (req, res, next) => {
    try {
      const { phone, otp } = req.body;
      await this.userService.verifyPhoneOTP(phone, otp);

      res.status(200).json({
        success: true,
        data: {
          message: 'Phone verified successfully'
        }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Resend verification OTP
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  resendVerificationOTP = asyncHandler(async (req, res, next) => {
    try {
      const { type, identifier } = req.body;
      await this.userService.resendVerificationOTP(type, identifier);

      res.status(200).json({
        success: true,
        data: {
          message: `Verification OTP sent to ${type}`
        }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Login user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  login = asyncHandler(async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const deviceInfo = {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        deviceId: req.headers['x-device-id'] || 'unknown'
      };

      const { user, accessToken, refreshToken } = await this.userService.login(
        email,
        password,
        deviceInfo
      );

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        success: true,
        data: {
          user,
          accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Refresh access token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  refreshToken = asyncHandler(async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      const deviceInfo = {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        deviceId: req.headers['x-device-id'] || 'unknown'
      };

      const { accessToken, refreshToken: newRefreshToken } = await this.userService.refreshToken(
        refreshToken,
        deviceInfo
      );

      // Set new refresh token in HTTP-only cookie
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        success: true,
        data: {
          accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Logout user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  logout = asyncHandler(async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      await this.userService.logout(req.user.id, refreshToken);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Get user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getProfile = asyncHandler(async (req, res, next) => {
    try {
      const user = await this.userService.getProfile(req.user.id);
      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Update user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  updateProfile = asyncHandler(async (req, res, next) => {
    try {
      const user = await this.userService.updateProfile(req.user.id, req.body);
      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Change user password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  changePassword = asyncHandler(async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      await this.userService.changePassword(req.user.id, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  });
} 