import { AppError } from '../utils/errors/AppError.js';
import { emailService } from './EmailService.js';
import { smsService } from './SMSService.js';

class NotificationService {
  constructor() {
    this.emailService = emailService;
    this.smsService = smsService;
  }

  /**
   * Send verification OTP
   * @param {string} type - Type of verification (email/phone)
   * @param {string} identifier - Email or phone number
   * @param {string} otp - OTP to send
   * @param {Object} options - Additional options
   * @returns {Promise<void>}
   */
  async sendVerificationOTP(type, identifier, otp, options = {}) {
    try {
      switch (type) {
        case 'email':
          await this.emailService.sendVerificationEmail(identifier, otp, options);
          break;
        case 'phone':
          await this.smsService.sendVerificationSMS(identifier, otp, options);
          break;
        default:
          throw new AppError('Invalid verification type', 400);
      }
    } catch (error) {
      throw new AppError(`Failed to send ${type} verification OTP`, 500);
    }
  }

  /**
   * Send welcome notification
   * @param {string} type - Type of notification (email/phone)
   * @param {string} identifier - Email or phone number
   * @param {Object} userData - User data for personalization
   * @returns {Promise<void>}
   */
  async sendWelcomeNotification(type, identifier, userData) {
    try {
      switch (type) {
        case 'email':
          await this.emailService.sendWelcomeEmail(identifier, userData);
          break;
        case 'phone':
          await this.smsService.sendWelcomeSMS(identifier, userData);
          break;
        default:
          throw new AppError('Invalid notification type', 400);
      }
    } catch (error) {
      throw new AppError(`Failed to send ${type} welcome notification`, 500);
    }
  }
}

export const notificationService = new NotificationService(); 