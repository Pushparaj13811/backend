import { AppError } from '../utils/errors/AppError.js';
import nodemailer from 'nodemailer';
import env from '../config/env.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    });
  }

  /**
   * Send verification email
   * @param {string} email - Recipient email
   * @param {string} otp - OTP to send
   * @param {Object} options - Additional options
   * @returns {Promise<void>}
   */
  async sendVerificationEmail(email, otp, options = {}) {
    try {
      const mailOptions = {
        from: `"${env.APP_NAME}" <${env.SMTP_FROM}>`,
        to: email,
        subject: 'Verify Your Email',
        html: this._getVerificationEmailTemplate(otp, options)
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new AppError('Failed to send verification email', 500);
    }
  }

  /**
   * Send welcome email
   * @param {string} email - Recipient email
   * @param {Object} userData - User data for personalization
   * @returns {Promise<void>}
   */
  async sendWelcomeEmail(email, userData) {
    try {
      const mailOptions = {
        from: `"${env.APP_NAME}" <${env.SMTP_FROM}>`,
        to: email,
        subject: 'Welcome to Our Platform',
        html: this._getWelcomeEmailTemplate(userData)
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new AppError('Failed to send welcome email', 500);
    }
  }

  /**
   * Get verification email template
   * @private
   * @param {string} otp - OTP to include
   * @param {Object} options - Additional options
   * @returns {string} HTML template
   */
  _getVerificationEmailTemplate(otp, options = {}) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify Your Email</h2>
        <p>Your verification code is:</p>
        <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This is an automated message, please do not reply.
        </p>
      </div>
    `;
  }

  /**
   * Get welcome email template
   * @private
   * @param {Object} userData - User data for personalization
   * @returns {string} HTML template
   */
  _getWelcomeEmailTemplate(userData) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to ${env.APP_NAME}!</h2>
        <p>Hello ${userData.firstName},</p>
        <p>Thank you for joining our platform. We're excited to have you on board!</p>
        <p>Here are a few things you can do to get started:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Browse our products</li>
          <li>Set up your preferences</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This is an automated message, please do not reply.
        </p>
      </div>
    `;
  }
}

export const emailService = new EmailService(); 