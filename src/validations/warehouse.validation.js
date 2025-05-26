import Joi from 'joi';

export const warehouseValidation = {
  create: Joi.object({
    name: Joi.string().required().min(2).max(100),
    code: Joi.string().required().min(2).max(10).uppercase(),
    type: Joi.string().valid('main', 'regional', 'distribution', 'retail', 'other').default('main'),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      postalCode: Joi.string().required()
    }).required(),
    contact: Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().required().pattern(/^\+?[\d\s-]{10,}$/),
      email: Joi.string().email().required()
    }).required(),
    capacity: Joi.object({
      total: Joi.number().required().min(0),
      unit: Joi.string().valid('sqft', 'sqm', 'pallets', 'units').default('sqft')
    }).required(),
    status: Joi.string().valid('active', 'inactive', 'maintenance').default('active'),
    operatingHours: Joi.object({
      monday: Joi.object({ open: Joi.string(), close: Joi.string() }),
      tuesday: Joi.object({ open: Joi.string(), close: Joi.string() }),
      wednesday: Joi.object({ open: Joi.string(), close: Joi.string() }),
      thursday: Joi.object({ open: Joi.string(), close: Joi.string() }),
      friday: Joi.object({ open: Joi.string(), close: Joi.string() }),
      saturday: Joi.object({ open: Joi.string(), close: Joi.string() }),
      sunday: Joi.object({ open: Joi.string(), close: Joi.string() })
    }),
    features: Joi.array().items(
      Joi.string().valid(
        'temperature-controlled',
        'hazardous-materials',
        'cross-docking',
        'loading-docks',
        'security-system',
        'cctv',
        'fire-protection',
        'other'
      )
    ),
    notes: Joi.string()
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100),
    code: Joi.string().min(2).max(10).uppercase(),
    type: Joi.string().valid('main', 'regional', 'distribution', 'retail', 'other'),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
      postalCode: Joi.string()
    }),
    contact: Joi.object({
      name: Joi.string(),
      phone: Joi.string().pattern(/^\+?[\d\s-]{10,}$/),
      email: Joi.string().email()
    }),
    capacity: Joi.object({
      total: Joi.number().min(0),
      unit: Joi.string().valid('sqft', 'sqm', 'pallets', 'units')
    }),
    status: Joi.string().valid('active', 'inactive', 'maintenance'),
    operatingHours: Joi.object({
      monday: Joi.object({ open: Joi.string(), close: Joi.string() }),
      tuesday: Joi.object({ open: Joi.string(), close: Joi.string() }),
      wednesday: Joi.object({ open: Joi.string(), close: Joi.string() }),
      thursday: Joi.object({ open: Joi.string(), close: Joi.string() }),
      friday: Joi.object({ open: Joi.string(), close: Joi.string() }),
      saturday: Joi.object({ open: Joi.string(), close: Joi.string() }),
      sunday: Joi.object({ open: Joi.string(), close: Joi.string() })
    }),
    features: Joi.array().items(
      Joi.string().valid(
        'temperature-controlled',
        'hazardous-materials',
        'cross-docking',
        'loading-docks',
        'security-system',
        'cctv',
        'fire-protection',
        'other'
      )
    ),
    notes: Joi.string()
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('active', 'inactive', 'maintenance').required()
  })
}; 