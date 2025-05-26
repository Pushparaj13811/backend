import { BaseService } from './BaseService.js';
import { AppError } from '../utils/errors/AppError.js';
import { otpService } from './OTPService.js';
import { notificationService } from './NotificationService.js';

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

    // Create unverified user
    const user = await this.repository.create({
      ...userData,
      email,
      phone,
      emailVerification: { isVerified: false },
      phoneVerification: { isVerified: false }
    });

    return { userId: user._id };
  }

  /**
   * Verify email OTP
   * @param {string} email - User email
   * @param {string} otp - OTP to verify
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

    await this.repository.update(user._id, {
      'emailVerification.isVerified': true,
      'emailVerification.verifiedAt': new Date()
    });
  }

  /**
   * Verify phone OTP
   * @param {string} phone - User phone number
   * @param {string} otp - OTP to verify
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

    await this.repository.update(user._id, {
      'phoneVerification.isVerified': true,
      'phoneVerification.verifiedAt': new Date()
    });
  }

  /**
   * Resend verification OTP
   * @param {string} type - Type of verification (email/phone)
   * @param {string} identifier - Email or phone number
   */
  async resendVerificationOTP(type, identifier) {
    // Check if user exists
    const user = type === 'email' 
      ? await this.repository.findByEmail(identifier)
      : await this.repository.findByPhone(identifier);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if already verified
    if (type === 'email' && user.emailVerification.isVerified) {
      throw new AppError('Email already verified', 400);
    }
    if (type === 'phone' && user.phoneVerification.isVerified) {
      throw new AppError('Phone already verified', 400);
    }

    // Generate and store new OTP
    const otp = await otpService.generateAndStoreOTP(type, identifier);

    // Send verification OTP
    await notificationService.sendVerificationOTP(type, identifier, otp);
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} deviceInfo - Device information
   * @returns {Promise<Object>} Login result
   */
  async login(email, password, deviceInfo) {
    const user = await this.repository.findByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.emailVerification.isVerified) {
      throw new AppError('Please verify your email first', 403);
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Update user's last login
    await this.repository.update(user._id, {
      lastLogin: new Date(),
      'analytics.loginCount': (user.analytics?.loginCount || 0) + 1,
      'security.lastLogin': {
        timestamp: new Date(),
        ip: deviceInfo.ip,
        userAgent: deviceInfo.userAgent,
        deviceId: deviceInfo.deviceId
      }
    });

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken
    };
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
} 