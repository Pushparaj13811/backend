import dotenv from 'dotenv';
import joi from 'joi';

dotenv.config();

const schema = joi.object({
  NODE_ENV: joi.string().valid('development', 'production', 'test').required(),
  PORT:     joi.number().default(3000),
  MONGODB_URI: joi.string().uri().required()
}).unknown();

const { error, value: env } = schema.validate(process.env);
if (error) throw new Error(`❌ Invalid env: ${error.message}`);

export default env;
