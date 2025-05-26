import dotenv from 'dotenv';
import joi from 'joi';

dotenv.config();

const schema = joi.object({
  // Server
  NODE_ENV: joi.string().valid('development', 'production', 'test').required(),
  PORT: joi.number().default(3000),
  APP_NAME: joi.string().default('Supermarket API'),
  
  // Database
  MONGODB_URI: joi.string().uri().required(),
  
  // Redis
  REDIS_HOST: joi.string().required(),
  REDIS_PORT: joi.number().default(6379),
  REDIS_PASSWORD: joi.string().allow(''),
  
  // JWT
  JWT_SECRET: joi.string().required(),
  JWT_EXPIRES_IN: joi.string().default('1d'),
  JWT_REFRESH_SECRET: joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: joi.string().default('7d'),
  
  // CORS
  CORS_ORIGIN: joi.string().required(),
  
  // Email
  SMTP_HOST: joi.string().required(),
  SMTP_PORT: joi.number().required(),
  SMTP_SECURE: joi.boolean().default(false),
  SMTP_USER: joi.string().required(),
  SMTP_PASS: joi.string().required(),
  SMTP_FROM: joi.string().email().required(),
  
  // SMS (Twilio)
  TWILIO_ACCOUNT_SID: joi.string().required(),
  TWILIO_AUTH_TOKEN: joi.string().required(),
  TWILIO_PHONE_NUMBER: joi.string().required(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: joi.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX: joi.number().default(100),
  
  // OTP
  OTP_EXPIRY_MINUTES: joi.number().default(10),
  OTP_MAX_ATTEMPTS: joi.number().default(3)
}).unknown();

const { error, value: env } = schema.validate(process.env);
if (error) throw new Error(`❌ Invalid env: ${error.message}`);

export default env;
