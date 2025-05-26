import Joi from 'joi';

export const wishlistValidation = {
  create: Joi.object({
    name: Joi.string().required().min(3).max(100),
    description: Joi.string().max(500),
    isDefault: Joi.boolean().default(false),
    isPublic: Joi.boolean().default(false)
  }),

  update: Joi.object({
    name: Joi.string().min(3).max(100),
    description: Joi.string().max(500),
    isDefault: Joi.boolean(),
    isPublic: Joi.boolean()
  }),

  updateVisibility: Joi.object({
    isPublic: Joi.boolean().required()
  }),

  addItem: Joi.object({
    product: Joi.string().required(),
    notes: Joi.string().max(500)
  })
}; 