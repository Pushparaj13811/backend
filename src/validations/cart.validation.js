import Joi from 'joi';

export const cartValidation = {
  create: Joi.object({
    currency: Joi.string().default('USD'),
    shipping: Joi.number().min(0).default(0),
    discount: Joi.number().min(0).default(0)
  }),

  update: Joi.object({
    currency: Joi.string(),
    shipping: Joi.number().min(0),
    discount: Joi.number().min(0)
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('active', 'abandoned', 'converted').required()
  }),

  addItem: Joi.object({
    product: Joi.string().required(),
    store: Joi.string().required(),
    quantity: Joi.number().required().min(1),
    selectedOptions: Joi.object().pattern(Joi.string(), Joi.string()),
    notes: Joi.string().max(500)
  }),

  updateQuantity: Joi.object({
    quantity: Joi.number().required().min(1)
  })
};