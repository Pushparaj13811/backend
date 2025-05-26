import { AppError } from '../utils/errors/AppError.js';
import { redisClient } from '../config/redis.js';
import { generateOTP } from '../utils/otp.js';

class OTPService {
  constructor() {
    this.redisClient = redisClient;
    this.OTP_EXPIRY = 10 * 60; // 10 minutes in seconds
    this.MAX_ATTEMPTS = 3;
  }

  /**
   * Generate and store OTP for verification
   * @param {string} type - Type of verification (email/phone)
   * @param {string} identifier - Email or phone number
   * @returns {Promise<string>} Generated OTP
   */
  async generateAndStoreOTP(type, identifier) {
    try {
      const otp = generateOTP();
      const key = this._getOTPKey(type, identifier);
      
      // Store OTP with expiry and attempts counter
      await this.redisClient.hset(key, 'otp', otp);
      await this.redisClient.hset(key, 'attempts', '0');
      await this.redisClient.hset(key, 'createdAt', Date.now().toString());
      
      // Set expiry on the key
      await this.redisClient.expire(key, this.OTP_EXPIRY);
      
      return otp;
    } catch (error) {
      throw new AppError('Failed to generate OTP', 500);
    }
  }

  /**
   * Verify OTP
   * @param {string} type - Type of verification (email/phone)
   * @param {string} identifier - Email or phone number
   * @param {string} otp - OTP to verify
   * @returns {Promise<boolean>} Whether OTP is valid
   */
  async verifyOTP(type, identifier, otp) {
    try {
      const key = this._getOTPKey(type, identifier);
      const data = await this.redisClient.hgetall(key);

      if (!data || !data.otp) {
        throw new AppError('OTP expired or not found', 400);
      }

      // Check attempts
      const attempts = parseInt(data.attempts) + 1;
      if (attempts > this.MAX_ATTEMPTS) {
        await this.redisClient.del(key);
        throw new AppError('Maximum attempts exceeded', 400);
      }

      // Update attempts
      await this.redisClient.hset(key, 'attempts', attempts.toString());

      // Verify OTP
      if (data.otp !== otp) {
        return false;
      }

      // Delete OTP after successful verification
      await this.redisClient.del(key);
      return true;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to verify OTP', 500);
    }
  }

  /**
   * Check if OTP exists and is valid
   * @param {string} type - Type of verification (email/phone)
   * @param {string} identifier - Email or phone number
   * @returns {Promise<boolean>} Whether OTP exists and is valid
   */
  async hasValidOTP(type, identifier) {
    try {
      const key = this._getOTPKey(type, identifier);
      const exists = await this.redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      throw new AppError('Failed to check OTP status', 500);
    }
  }

  /**
   * Get remaining time for OTP
   * @param {string} type - Type of verification (email/phone)
   * @param {string} identifier - Email or phone number
   * @returns {Promise<number>} Remaining time in seconds
   */
  async getOTPRemainingTime(type, identifier) {
    try {
      const key = this._getOTPKey(type, identifier);
      return await this.redisClient.ttl(key);
    } catch (error) {
      throw new AppError('Failed to get OTP remaining time', 500);
    }
  }

  /**
   * Get remaining attempts for OTP
   * @param {string} type - Type of verification (email/phone)
   * @param {string} identifier - Email or phone number
   * @returns {Promise<number>} Remaining attempts
   */
  async getOTPRemainingAttempts(type, identifier) {
    try {
      const key = this._getOTPKey(type, identifier);
      const data = await this.redisClient.hgetall(key);
      return this.MAX_ATTEMPTS - (parseInt(data.attempts) || 0);
    } catch (error) {
      throw new AppError('Failed to get OTP remaining attempts', 500);
    }
  }

  /**
   * Delete OTP
   * @param {string} type - Type of verification (email/phone)
   * @param {string} identifier - Email or phone number
   * @returns {Promise<void>}
   */
  async deleteOTP(type, identifier) {
    try {
      const key = this._getOTPKey(type, identifier);
      await this.redisClient.del(key);
    } catch (error) {
      throw new AppError('Failed to delete OTP', 500);
    }
  }

  /**
   * Get Redis key for OTP
   * @private
   * @param {string} type - Type of verification (email/phone)
   * @param {string} identifier - Email or phone number
   * @returns {string} Redis key
   */
  _getOTPKey(type, identifier) {
    return `otp:${type}:${identifier}`;
  }
}

export const otpService = new OTPService(); 