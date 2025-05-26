import Joi from 'joi';

export const categoryValidation = {
  create: Joi.object({
    name: Joi.string().required().max(100),
    description: Joi.string().max(500),
    parent: Joi.string().hex().length(24),
    image: Joi.string().uri(),
    banner: Joi.string().uri(),
    attributes: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        type: Joi.string().valid('text', 'number', 'boolean', 'select', 'multiselect').required(),
        required: Joi.boolean(),
        options: Joi.array().items(Joi.string()).when('type', {
          is: Joi.string().valid('select', 'multiselect'),
          then: Joi.required(),
          otherwise: Joi.forbidden()
        })
      })
    ),
    seo: Joi.object({
      title: Joi.string().max(60),
      description: Joi.string().max(160),
      keywords: Joi.array().items(Joi.string())
    }),
    status: Joi.string().valid('active', 'inactive', 'archived')
  }),

  update: Joi.object({
    name: Joi.string().max(100),
    description: Joi.string().max(500),
    parent: Joi.string().hex().length(24),
    image: Joi.string().uri(),
    banner: Joi.string().uri(),
    attributes: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        type: Joi.string().valid('text', 'number', 'boolean', 'select', 'multiselect').required(),
        required: Joi.boolean(),
        options: Joi.array().items(Joi.string()).when('type', {
          is: Joi.string().valid('select', 'multiselect'),
          then: Joi.required(),
          otherwise: Joi.forbidden()
        })
      })
    ),
    seo: Joi.object({
      title: Joi.string().max(60),
      description: Joi.string().max(160),
      keywords: Joi.array().items(Joi.string())
    }),
    status: Joi.string().valid('active', 'inactive', 'archived')
  }),

  moveCategory: Joi.object({
    newParentId: Joi.string().hex().length(24).allow(null)
  })
}; 