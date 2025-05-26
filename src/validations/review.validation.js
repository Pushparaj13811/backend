import Joi from 'joi';

export const reviewValidation = {
  create: Joi.object({
    store: Joi.string().required(),
    product: Joi.string(),
    rating: Joi.number().required().min(1).max(5),
    title: Joi.string().required().max(100),
    content: Joi.string().required().max(1000),
    images: Joi.array().items(Joi.string().uri()),
    isVerifiedPurchase: Joi.boolean().default(false)
  }),

  update: Joi.object({
    rating: Joi.number().min(1).max(5),
    title: Joi.string().max(100),
    content: Joi.string().max(1000),
    images: Joi.array().items(Joi.string().uri())
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('pending', 'approved', 'rejected').required()
  })
}; 