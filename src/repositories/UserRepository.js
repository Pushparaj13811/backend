import { BaseRepository } from './BaseRepository.js';
import User from '../models/user/user.model.js';

export class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.findOne({ email: email.toLowerCase() });
  }

  async findByEmailAndSelectPassword(email) {
    return await this.model.findOne({ email: email.toLowerCase() }).select('+password');
  }

  async createVerificationToken(userId, token, expires) {
    return await this.update(userId, {
      'emailVerification.token': token,
      'emailVerification.expires': expires
    });
  }

  async verifyEmail(userId) {
    return await this.update(userId, {
      'emailVerification.isVerified': true,
      'emailVerification.verifiedAt': new Date(),
      'emailVerification.token': undefined,
      'emailVerification.expires': undefined,
      status: 'active'
    });
  }

  async createPasswordResetToken(userId, token, expires) {
    return await this.update(userId, {
      'passwordReset.token': token,
      'passwordReset.expires': expires
    });
  }

  async resetPassword(userId, hashedPassword) {
    return await this.update(userId, {
      password: hashedPassword,
      'passwordReset.token': undefined,
      'passwordReset.expires': undefined,
      'passwordReset.lastResetAt': new Date()
    });
  }

  async addRefreshToken(userId, tokenData) {
    return await this.update(userId, {
      $push: { refreshTokens: tokenData }
    });
  }

  async removeRefreshToken(userId, token) {
    return await this.update(userId, {
      $pull: { refreshTokens: { token } }
    });
  }
} 