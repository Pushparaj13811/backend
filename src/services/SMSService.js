import { AppError } from '../utils/errors/AppError.js';
import twilio from 'twilio';
import env from '../config/env.js';

class SMSService {
  constructor() {
    this.client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    this.from = env.TWILIO_PHONE_NUMBER;
  }

  /**
   * Send verification SMS
   * @param {string} phone - Recipient phone number
   * @param {string} otp - OTP to send
   * @param {Object} options - Additional options
   * @returns {Promise<void>}
   */
  async sendVerificationSMS(phone, otp, options = {}) {
    try {
      const message = this._getVerificationSMSTemplate(otp, options);
      await this.client.messages.create({
        body: message,
        from: this.from,
        to: phone
      });
    } catch (error) {
      throw new AppError('Failed to send verification SMS', 500);
    }
  }

  /**
   * Send welcome SMS
   * @param {string} phone - Recipient phone number
   * @param {Object} userData - User data for personalization
   * @returns {Promise<void>}
   */
  async sendWelcomeSMS(phone, userData) {
    try {
      const message = this._getWelcomeSMSTemplate(userData);
      await this.client.messages.create({
        body: message,
        from: this.from,
        to: phone
      });
    } catch (error) {
      throw new AppError('Failed to send welcome SMS', 500);
    }
  }

  /**
   * Get verification SMS template
   * @private
   * @param {string} otp - OTP to include
   * @param {Object} options - Additional options
   * @returns {string} SMS message
   */
  _getVerificationSMSTemplate(otp, options = {}) {
    return `Your verification code is: ${otp}. This code will expire in 10 minutes.`;
  }

  /**
   * Get welcome SMS template
   * @private
   * @param {Object} userData - User data for personalization
   * @returns {string} SMS message
   */
  _getWelcomeSMSTemplate(userData) {
    return `Welcome to ${env.APP_NAME}! We're excited to have you on board, ${userData.firstName}.`;
  }
}

export const smsService = new SMSService(); 