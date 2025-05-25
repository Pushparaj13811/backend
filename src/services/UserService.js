import { BaseService } from './BaseService.js';
import { AppError } from '../utils/errors/AppError.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../config/env.js';

export class UserService extends BaseService {
  constructor(repository) {
    super(repository);
  }

  async register(userData) {
    // Check if user already exists
    const existingUser = await this.repository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Create user
    const user = await this.repository.create(userData);

    // Generate verification token
    const verificationToken = user.createEmailVerificationToken();
    await this.repository.createVerificationToken(
      user._id,
      user.emailVerification.token,
      user.emailVerification.expires
    );

    // Remove sensitive data
    user.password = undefined;
    user.emailVerification.token = undefined;
    user.emailVerification.expires = undefined;

    return { user, verificationToken };
  }

  async login(email, password, deviceInfo) {
    // Find user and select password
    const user = await this.repository.findByEmailAndSelectPassword(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if account is locked
    if (user.isLocked()) {
      throw new AppError('Account is locked. Please try again later', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      throw new AppError('Invalid email or password', 401);
    }

    // Check email verification
    if (!user.emailVerification.isVerified) {
      throw new AppError('Please verify your email first', 401);
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

    // Save refresh token
    const tokenData = {
      token: refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      deviceInfo
    };
    await this.repository.addRefreshToken(user._id, tokenData);

    // Update security info
    await this.repository.update(user._id, {
      'security.loginAttempts': 0,
      'security.lockUntil': undefined,
      'security.lastLogin': new Date(),
      'security.lastLoginIP': deviceInfo.ip
    });

    // Remove sensitive data
    user.password = undefined;
    user.refreshTokens = undefined;

    return { user, accessToken, refreshToken };
  }

  async verifyEmail(token) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await this.repository.findOne({
      'emailVerification.token': hashedToken,
      'emailVerification.expires': { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    await this.repository.verifyEmail(user._id);
    return { message: 'Email verified successfully' };
  }

  async refreshToken(token, deviceInfo) {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
      const user = await this.repository.findById(decoded.id);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Check if refresh token exists and is valid
      const refreshTokenData = user.refreshTokens.find(
        (rt) => rt.token === token && rt.expiresAt > Date.now()
      );

      if (!refreshTokenData) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Generate new tokens
      const accessToken = this.generateAccessToken(user._id);
      const newRefreshToken = this.generateRefreshToken(user._id);

      // Update refresh token
      await this.repository.removeRefreshToken(user._id, token);
      await this.repository.addRefreshToken(user._id, {
        token: newRefreshToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        deviceInfo
      });

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async logout(userId, token) {
    await this.repository.removeRefreshToken(userId, token);
    return { message: 'Logged out successfully' };
  }

  generateAccessToken(userId) {
    return jwt.sign({ id: userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN
    });
  }

  generateRefreshToken(userId) {
    return jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, {
      expiresIn: '7d'
    });
  }
} 