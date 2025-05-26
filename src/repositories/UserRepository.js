import { BaseRepository } from './BaseRepository.js';
import User from '../models/user/user.model.js';
import { AppError } from '../utils/errors/AppError.js';

export class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async create(userData) {
    try {
      const user = await User.create(userData);
      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError('Email or phone already exists', 400);
      }
      throw error;
    }
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} User
   */
  async findById(id) {
    return User.findById(id);
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User
   */
  async findByEmail(email) {
    return this.findOne({ email });
  }

  /**
   * Find user by phone
   * @param {string} phone - User phone number
   * @returns {Promise<Object>} User
   */
  async findByPhone(phone) {
    return this.findOne({ phone });
  }

  /**
   * Find user by email or phone
   * @param {string} email - User email
   * @param {string} phone - User phone number
   * @returns {Promise<Object>} User
   */
  async findByEmailOrPhone(email, phone) {
    return this.findOne({
      $or: [
        { email },
        ...(phone ? [{ phone }] : [])
      ]
    });
  }

  /**
   * Find user by refresh token
   * @param {string} token - Refresh token
   * @returns {Promise<Object>} User
   */
  async findByRefreshToken(token) {
    return this.findOne({
      'refreshTokens.token': token,
      'refreshTokens.expiresAt': { $gt: new Date() }
    });
  }

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated user
   */
  async update(id, updateData) {
    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  /**
   * Update user's refresh token
   * @param {string} id - User ID
   * @param {string} newToken - New refresh token
   * @returns {Promise<void>}
   */
  async updateRefreshToken(id, newToken) {
    await this.update(id, {
      $push: {
        refreshTokens: {
          token: newToken,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      }
    });
  }

  /**
   * Invalidate refresh token
   * @param {string} id - User ID
   * @param {string} token - Token to invalidate
   * @returns {Promise<void>}
   */
  async invalidateRefreshToken(id, token) {
    await this.update(id, {
      $pull: {
        refreshTokens: { token }
      }
    });
  }

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
  }
} 