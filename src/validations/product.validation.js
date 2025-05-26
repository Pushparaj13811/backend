import Joi from 'joi';

export const productValidation = {
  create: Joi.object({
    name: Joi.string().required().max(100),
    description: Joi.string().required(),
    shortDescription: Joi.string().max(200),
    category: Joi.string().hex().length(24).required(),
    sku: Joi.string().required(),
    barcode: Joi.string(),
    basePrice: Joi.number().required().min(0),
    salePrice: Joi.number().min(0),
    costPrice: Joi.number().min(0),
    taxRate: Joi.number().min(0).max(100),
    currency: Joi.string().default('USD'),
    images: Joi.array().items(Joi.string().uri()),
    videos: Joi.array().items(Joi.string().uri()),
    specifications: Joi.object(),
    variants: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        sku: Joi.string().required(),
        attributes: Joi.object().required(),
        price: Joi.number().min(0),
        salePrice: Joi.number().min(0),
        inventory: Joi.object({
          quantity: Joi.number().integer().min(0).required(),
          reserved: Joi.number().integer().min(0),
          damaged: Joi.number().integer().min(0),
          expired: Joi.number().integer().min(0)
        })
      })
    ),
    shipping: Joi.object({
      weight: Joi.number().min(0),
      dimensions: Joi.object({
        length: Joi.number().min(0),
        width: Joi.number().min(0),
        height: Joi.number().min(0)
      }),
      freeShipping: Joi.boolean(),
      restrictions: Joi.array().items(Joi.string())
    }),
    seo: Joi.object({
      title: Joi.string().max(60),
      description: Joi.string().max(160),
      keywords: Joi.array().items(Joi.string())
    }),
    status: Joi.string().valid('draft', 'active', 'inactive', 'discontinued'),
    tags: Joi.array().items(Joi.string())
  }),

  update: Joi.object({
    name: Joi.string().max(100),
    description: Joi.string(),
    shortDescription: Joi.string().max(200),
    category: Joi.string().hex().length(24),
    sku: Joi.string(),
    barcode: Joi.string(),
    basePrice: Joi.number().min(0),
    salePrice: Joi.number().min(0),
    costPrice: Joi.number().min(0),
    taxRate: Joi.number().min(0).max(100),
    currency: Joi.string(),
    images: Joi.array().items(Joi.string().uri()),
    videos: Joi.array().items(Joi.string().uri()),
    specifications: Joi.object(),
    variants: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        sku: Joi.string().required(),
        attributes: Joi.object().required(),
        price: Joi.number().min(0),
        salePrice: Joi.number().min(0),
        inventory: Joi.object({
          quantity: Joi.number().integer().min(0).required(),
          reserved: Joi.number().integer().min(0),
          damaged: Joi.number().integer().min(0),
          expired: Joi.number().integer().min(0)
        })
      })
    ),
    shipping: Joi.object({
      weight: Joi.number().min(0),
      dimensions: Joi.object({
        length: Joi.number().min(0),
        width: Joi.number().min(0),
        height: Joi.number().min(0)
      }),
      freeShipping: Joi.boolean(),
      restrictions: Joi.array().items(Joi.string())
    }),
    seo: Joi.object({
      title: Joi.string().max(60),
      description: Joi.string().max(160),
      keywords: Joi.array().items(Joi.string())
    }),
    status: Joi.string().valid('draft', 'active', 'inactive', 'discontinued'),
    tags: Joi.array().items(Joi.string())
  }),

  updateInventory: Joi.object({
    quantity: Joi.number().integer().min(0),
    reserved: Joi.number().integer().min(0),
    damaged: Joi.number().integer().min(0),
    expired: Joi.number().integer().min(0),
    reorderLevel: Joi.number().integer().min(0),
    maxStockLevel: Joi.number().integer().min(0),
    location: Joi.string()
  }),

  search: Joi.object({
    q: Joi.string().required(),
    category: Joi.string().hex().length(24),
    status: Joi.string().valid('draft', 'active', 'inactive', 'discontinued'),
    minPrice: Joi.number().min(0),
    maxPrice: Joi.number().min(0),
    inStock: Joi.boolean(),
    onSale: Joi.boolean(),
    sort: Joi.string().valid('price', '-price', 'name', '-name', 'createdAt', '-createdAt'),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100)
  })
}; 