import Joi from 'joi';

export const paymentValidation = {
  create: {
    body: Joi.object({
      order: Joi.string().required(),
      amount: Joi.number().required().min(1),
      currency: Joi.string().default('INR'),
      provider: Joi.string().valid('razorpay', 'stripe', 'paypal').default('razorpay'),
      paymentMethod: Joi.string().valid('card', 'netbanking', 'upi', 'wallet').default('card'),
      metadata: Joi.object()
    })
  },

  verify: {
    body: Joi.object({
      provider: Joi.string().valid('razorpay', 'stripe', 'paypal').required(),
      providerOrderId: Joi.string().required(),
      providerPaymentId: Joi.string().required(),
      providerSignature: Joi.string().when('provider', {
        is: 'razorpay',
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      providerData: Joi.object().when('provider', {
        is: Joi.string().valid('stripe', 'paypal'),
        then: Joi.required(),
        otherwise: Joi.optional()
      })
    })
  },

  refund: {
    body: Joi.object({
      refundAmount: Joi.number().required().min(1),
      reason: Joi.string().required().min(10).max(500),
      providerData: Joi.object().optional()
    })
  }
}; 