import { BaseService } from './BaseService.js';
import { AppError } from '../utils/errors/AppError.js';
import { otpService } from './OTPService.js';
import { notificationService } from './NotificationService.js';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export class UserService extends BaseService {
  constructor(userRepository) {
    super(userRepository);
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  async register(userData) {
    const { email, phone } = userData;

    // Check if user already exists
    const existingUser = await this.repository.findByEmailOrPhone(email, phone);
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Create unverified user
    const user = await this.repository.create({
      ...userData,
      email,
      phone,
      emailVerification: { isVerified: false },
      phoneVerification: { isVerified: false }
    });

    // Generate and store OTPs
    const [emailOTP, phoneOTP] = await Promise.all([
      otpService.generateAndStoreOTP('email', email),
      phone ? otpService.generateAndStoreOTP('phone', phone) : null
    ]);

    // Send verification OTPs
    await Promise.all([
      notificationService.sendVerificationOTP('email', email, emailOTP),
      phone ? notificationService.sendVerificationOTP('phone', phone, phoneOTP) : null
    ]);

    return { userId: user._id };
  }

  /**
   * Verify email OTP
   * @param {string} email - User email
   * @param {string} otp - OTP to verify
   * @returns {Promise<Object>} Verification result with tokens if successful
   */
  async verifyEmailOTP(email, otp) {
    // Verify OTP
    const isValid = await otpService.verifyOTP('email', email, otp);
    if (!isValid) {
      throw new AppError('Invalid OTP', 400);
    }

    // Update user verification status
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updateData = {
      'emailVerification.isVerified': true,
      'emailVerification.verifiedAt': new Date()
    };

    // If phone is already verified, update status to active
    if (user.phoneVerification?.isVerified) {
      updateData.status = 'active';
    }

    await this.repository.update(user._id, updateData);

    // Generate tokens for automatic login after verification
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Update user's refresh token
    await this.repository.updateRefreshToken(user._id, refreshToken);

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken
    };
  }

  /**
   * Verify phone OTP
   * @param {string} phone - User phone number
   * @param {string} otp - OTP to verify
   * @returns {Promise<Object>} Verification result with tokens if successful
   */
  async verifyPhoneOTP(phone, otp) {
    // Verify OTP
    const isValid = await otpService.verifyOTP('phone', phone, otp);
    if (!isValid) {
      throw new AppError('Invalid OTP', 400);
    }

    // Update user verification status
    const user = await this.repository.findByPhone(phone);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updateData = {
      'phoneVerification.isVerified': true,
      'phoneVerification.verifiedAt': new Date()
    };

    // If email is already verified, update status to active
    if (user.emailVerification?.isVerified) {
      updateData.status = 'active';
    }

    await this.repository.update(user._id, updateData);

    // Generate tokens for automatic login after verification
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Update user's refresh token
    await this.repository.updateRefreshToken(user._id, refreshToken);

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken
    };
  }

  /**
   * Resend verification OTP
   * @param {string} type - Type of verification (email/phone)
   * @param {string} identifier - Email or phone number
   * @param {string} [password] - User password for authenticated requests
   */
  async resendVerificationOTP(type, identifier, password) {
    // Find user by email or phone
    const user = type === 'email'
      ? await this.repository.findByEmail(identifier)
      : await this.repository.findByPhone(identifier);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // If password is provided, verify it
    if (password) {
      if (!(await user.comparePassword(password))) {
        throw new AppError('Invalid password', 401);
      }
    }

    // Check if already verified
    const verificationField = type === 'email' ? 'emailVerification' : 'phoneVerification';
    if (user[verificationField]?.isVerified) {
      throw new AppError(`${type.charAt(0).toUpperCase() + type.slice(1)} already verified`, 400);
    }

    // Generate and store new OTP
    const otp = await otpService.generateAndStoreOTP(type, identifier);

    // Send verification OTP
    await notificationService.sendVerificationOTP(type, identifier, otp);

    return { message: `Verification code sent to your ${type}` };
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} req - Express request object
   * @returns {Promise<Object>} User object with tokens
   */
  async login(email, password, req) {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if account is locked
    if (user.isLocked()) {
      throw new AppError('Account is locked. Please try again later', 401);
    }

    // Check if user is verified
    if (!user.emailVerification.isVerified) {
      // Generate and send new OTP
      const otp = await otpService.generateAndStoreOTP('email', email);
      await notificationService.sendVerificationOTP('email', email, otp);
      throw new AppError('Please verify your email first. A new verification code has been sent.', 401);
    }

    try {
      // Verify password
      await user.comparePassword(password);

      // Reset login attempts on successful login
      await user.resetLoginAttempts();

      // Update last login
      await user.updateLastLogin(req);

      // Generate tokens
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      // Update refresh token
      await this.updateRefreshToken(user._id, refreshToken);

      return {
        user: user.toJSON(),
        accessToken,
        refreshToken
      };
    } catch (error) {
      // Increment login attempts on failed login
      await user.incLoginAttempts();
      throw new AppError('Invalid email or password', 401);
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @param {Object} deviceInfo - Device information
   * @returns {Promise<Object>} New tokens
   */
  async refreshToken(refreshToken, deviceInfo) {
    const user = await this.repository.findByRefreshToken(refreshToken);
    if (!user) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Generate new tokens
    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    // Update user's refresh token
    await this.repository.updateRefreshToken(user._id, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Logout user
   * @param {string} userId - User ID
   * @param {string} refreshToken - Refresh token to invalidate
   */
  async logout(userId, refreshToken) {
    await this.repository.invalidateRefreshToken(userId, refreshToken);
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getProfile(userId) {
    const user = await this.repository.findById(userId);
    return user.toJSON();
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Profile update data
   * @returns {Promise<Object>} Updated user profile
   */
  async updateProfile(userId, updateData) {
    const updatedUser = await this.repository.update(userId, updateData);
    return updatedUser.toJSON();
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.repository.findById(userId);

    if (!(await user.comparePassword(currentPassword))) {
      throw new AppError('Current password is incorrect', 400);
    }

    await this.repository.update(userId, {
      password: newPassword,
      'security.lastPasswordChange': new Date(),
      'security.passwordHistory': [
        ...(user.security?.passwordHistory || []).slice(-4),
        user.password
      ]
    });
  }

  /**
   * Update user's refresh token
   * @param {string} userId - User ID
   * @param {string} refreshToken - New refresh token
   */
  async updateRefreshToken(userId, refreshToken) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Increment token version to invalidate all previous refresh tokens
    await this.repository.update(userId, {
      $inc: { 'security.tokenVersion': 1 },
      $push: {
        refreshTokens: {
          token: refreshToken,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + env.JWT_REFRESH_EXPIRY * 1000)
        }
      }
    });
  }

  /**
   * Invalidate refresh token
   * @param {string} userId - User ID
   * @param {string} refreshToken - Refresh token to invalidate
   */
  async invalidateRefreshToken(userId, refreshToken) {
    await this.repository.update(userId, {
      $pull: {
        refreshTokens: { token: refreshToken }
      }
    });
  }

  /**
   * Find user by refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} User object
   */
  async findByRefreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
      const user = await this.repository.findById(decoded.id);

      if (!user || user.security?.tokenVersion !== decoded.tokenVersion) {
        return null;
      }

      // Check if token exists in user's refresh tokens
      const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);
      if (!tokenExists) {
        return null;
      }

      return user;
    } catch (error) {
      return null;
    }
  }
} 