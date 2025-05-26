import Joi from 'joi';

export const inventoryValidation = {
  create: Joi.object({
    product: Joi.string().required(),
    warehouse: Joi.string().required(),
    quantity: Joi.number().required().min(0),
    unit: Joi.string().valid('pcs', 'kg', 'g', 'l', 'ml', 'box', 'pack').default('pcs'),
    location: Joi.object({
      aisle: Joi.string(),
      rack: Joi.string(),
      shelf: Joi.string(),
      bin: Joi.string()
    }),
    batchNumber: Joi.string(),
    expiryDate: Joi.date(),
    status: Joi.string().valid('available', 'reserved', 'damaged', 'quarantine').default('available'),
    minimumStock: Joi.number().min(0).default(0),
    maximumStock: Joi.number().min(0),
    reorderPoint: Joi.number().min(0),
    notes: Joi.string()
  }),

  update: Joi.object({
    product: Joi.string(),
    warehouse: Joi.string(),
    quantity: Joi.number().min(0),
    unit: Joi.string().valid('pcs', 'kg', 'g', 'l', 'ml', 'box', 'pack'),
    location: Joi.object({
      aisle: Joi.string(),
      rack: Joi.string(),
      shelf: Joi.string(),
      bin: Joi.string()
    }),
    batchNumber: Joi.string(),
    expiryDate: Joi.date(),
    status: Joi.string().valid('available', 'reserved', 'damaged', 'quarantine'),
    minimumStock: Joi.number().min(0),
    maximumStock: Joi.number().min(0),
    reorderPoint: Joi.number().min(0),
    notes: Joi.string()
  }),

  updateStock: Joi.object({
    quantity: Joi.number().required().min(0)
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('available', 'reserved', 'damaged', 'quarantine').required()
  }),

  findByLocation: Joi.object({
    location: Joi.object({
      aisle: Joi.string().required(),
      rack: Joi.string().required(),
      shelf: Joi.string().required(),
      bin: Joi.string().required()
    }).required()
  })
};