import Joi from 'joi';

export const registerSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(30)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name must be less than 30 characters long',
      'any.required': 'First name is required'
    }),

  lastName: Joi.string()
    .min(2)
    .max(30)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name must be less than 30 characters long',
      'any.required': 'Last name is required'
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
      'any.required': 'Password is required'
    }),

  phone: Joi.string()
    .pattern(/^\+?[\d\s\-\(\)]{10,15}$/)
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),

  addresses: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('home', 'work', 'other'),
      street: Joi.string().max(100).required(),
      city: Joi.string().max(50).required(),
      state: Joi.string().max(50).required(),
      country: Joi.string().max(50).required(),
      postalCode: Joi.string().max(20).required(),
      isDefault: Joi.boolean(),
      coordinates: Joi.object({
        type: Joi.string().valid('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2)
      })
    })
  ),

  preferences: Joi.object({
    newsletter: Joi.boolean(),
    smsNotifications: Joi.boolean(),
    emailNotifications: Joi.boolean(),
    language: Joi.string().valid('en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko'),
    currency: Joi.string().length(3).uppercase(),
    timezone: Joi.string()
  })
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
}); 