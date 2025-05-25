import asyncHandler from 'express-async-handler';
import { UserService } from '../services/UserService.js';
import { UserRepository } from '../repositories/UserRepository.js';

export class UserController {
  constructor() {
    const userRepository = new UserRepository();
    this.userService = new UserService(userRepository);
  }

  register = asyncHandler(async (req, res) => {
    const { user, verificationToken } = await this.userService.register(req.body);

    // TODO: Send verification email with token
    // For now, we'll just return the token in the response
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully. Please verify your email.',
      data: {
        user,
        verificationToken // Remove this in production
      }
    });
  });

  login = asyncHandler(async (req, res) => {
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
      status: 'success',
      data: {
        user,
        accessToken
      }
    });
  });

  verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const result = await this.userService.verifyEmail(token);

    res.status(200).json({
      status: 'success',
      message: result.message
    });
  });

  refreshToken = asyncHandler(async (req, res) => {
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
      status: 'success',
      data: {
        accessToken
      }
    });
  });

  logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    await this.userService.logout(req.user.id, refreshToken);

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  });
} 