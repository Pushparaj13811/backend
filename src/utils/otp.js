import crypto from 'crypto';

/**
 * Generate a random OTP
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} Generated OTP
 */
export const generateOTP = (length = 6) => {
  // Generate random bytes
  const bytes = crypto.randomBytes(length);
  
  // Convert to numbers and create OTP
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += bytes[i] % 10;
  }
  
  return otp;
};

/**
 * Generate a secure random token
 * @param {number} length - Length of token in bytes (default: 32)
 * @returns {string} Generated token
 */
export const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
}; 