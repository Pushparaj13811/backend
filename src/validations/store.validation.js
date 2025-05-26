import Joi from 'joi';

export const storeValidation = {
  create: Joi.object({
    name: Joi.string().required().min(3).max(100),
    description: Joi.string().max(1000),
    logo: Joi.string().uri(),
    banner: Joi.string().uri(),
    owner: Joi.string().required(),
    contact: Joi.object({
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      address: Joi.string().required()
    }).required(),
    settings: Joi.object({
      currency: Joi.string().default('USD'),
      taxRate: Joi.number().min(0).max(100).default(10),
      shippingPolicy: Joi.string(),
      returnPolicy: Joi.string(),
      privacyPolicy: Joi.string(),
      termsOfService: Joi.string()
    }),
    socialMedia: Joi.object({
      facebook: Joi.string().uri(),
      twitter: Joi.string().uri(),
      instagram: Joi.string().uri(),
      linkedin: Joi.string().uri()
    })
  }),

  update: Joi.object({
    name: Joi.string().min(3).max(100),
    description: Joi.string().max(1000),
    logo: Joi.string().uri(),
    banner: Joi.string().uri(),
    contact: Joi.object({
      email: Joi.string().email(),
      phone: Joi.string(),
      address: Joi.string()
    }),
    settings: Joi.object({
      currency: Joi.string(),
      taxRate: Joi.number().min(0).max(100),
      shippingPolicy: Joi.string(),
      returnPolicy: Joi.string(),
      privacyPolicy: Joi.string(),
      termsOfService: Joi.string()
    }),
    socialMedia: Joi.object({
      facebook: Joi.string().uri(),
      twitter: Joi.string().uri(),
      instagram: Joi.string().uri(),
      linkedin: Joi.string().uri()
    })
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('active', 'inactive', 'suspended').required()
  })
}; 