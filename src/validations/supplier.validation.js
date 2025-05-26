import Joi from 'joi';

export const supplierValidation = {
  create: Joi.object({
    name: Joi.string().required().min(2).max(100),
    email: Joi.string().email().required(),
    phone: Joi.string().required().pattern(/^\+?[\d\s-]{10,}$/),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      postalCode: Joi.string().required()
    }).required(),
    contactPerson: Joi.object({
      name: Joi.string().required(),
      position: Joi.string(),
      phone: Joi.string().pattern(/^\+?[\d\s-]{10,}$/),
      email: Joi.string().email()
    }).required(),
    status: Joi.string().valid('active', 'inactive', 'suspended').default('active'),
    paymentTerms: Joi.string(),
    taxId: Joi.string(),
    notes: Joi.string()
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^\+?[\d\s-]{10,}$/),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
      postalCode: Joi.string()
    }),
    contactPerson: Joi.object({
      name: Joi.string(),
      position: Joi.string(),
      phone: Joi.string().pattern(/^\+?[\d\s-]{10,}$/),
      email: Joi.string().email()
    }),
    status: Joi.string().valid('active', 'inactive', 'suspended'),
    paymentTerms: Joi.string(),
    taxId: Joi.string(),
    notes: Joi.string()
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('active', 'inactive', 'suspended').required()
  })
}; 