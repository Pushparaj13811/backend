import Joi from 'joi';

export const userValidation = {
  register: Joi.object({
    firstName: Joi.string().required().min(2).max(50),
    lastName: Joi.string().required().min(2).max(50),
    email: Joi.string().required().email(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    password: Joi.string()
      .required()
      .min(8)
      .max(100)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .message('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
    confirmPassword: Joi.string().required().valid(Joi.ref('password')),
    role: Joi.string().valid('user', 'admin').default('user'),
    preferences: Joi.object({
      language: Joi.string().valid('en', 'es', 'fr').default('en'),
      currency: Joi.string().valid('USD', 'EUR', 'GBP').default('USD'),
      timezone: Joi.string().default('UTC'),
      theme: Joi.string().valid('light', 'dark', 'system').default('system')
    })
  }),

  verifyEmailOTP: Joi.object({
    email: Joi.string().required().email(),
    otp: Joi.string().required().length(6).pattern(/^\d+$/)
  }),

  verifyPhoneOTP: Joi.object({
    phone: Joi.string().required().pattern(/^\+?[1-9]\d{1,14}$/),
    otp: Joi.string().required().length(6).pattern(/^\d+$/)
  }),

  resendOTP: Joi.object({
    type: Joi.string().required().valid('email', 'phone'),
    identifier: Joi.string().required()
  }),

  login: Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required()
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required()
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    preferences: Joi.object({
      language: Joi.string().valid('en', 'es', 'fr'),
      currency: Joi.string().valid('USD', 'EUR', 'GBP'),
      timezone: Joi.string(),
      theme: Joi.string().valid('light', 'dark', 'system')
    })
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
      .required()
      .min(8)
      .max(100)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .message('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
    confirmPassword: Joi.string().required().valid(Joi.ref('newPassword'))
  })
}; 