import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { RedisManager } from './redis/RedisManager.js';

// Create store
const store = new RedisStore({
  client: RedisManager.getRateLimiterInstance().client,
  prefix: 'rate-limit:',
  windowMs: 15 * 60 * 1000, // 15 minutes
});

// Create limiter factory
export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000, // 15 minutes
  max = 100, // Limit each IP to 100 requests per windowMs
  message = 'Too many requests from this IP, please try again later',
  keyGenerator = (req) => req.ip, // Use IP as default key
  skip = (req) => false, // Don't skip any requests by default
  handler = (req, res) => {
    res.status(429).json({
      status: 'error',
      message
    });
  }
} = {}) => {
  return rateLimit({
    store,
    windowMs,
    max,
    message,
    keyGenerator,
    skip,
    handler,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
};

// Predefined limiters
export const authLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: 'Too many login attempts, please try again after an hour',
  keyGenerator: (req) => `${req.ip}-${req.body.email || 'unknown'}`, // Rate limit by IP and email
});

export const registerLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // 3 registrations per day
  message: 'Too many registration attempts, please try again tomorrow',
  keyGenerator: (req) => `${req.ip}-register`, // Rate limit by IP
});

export const verifyEmailLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: 'Too many email verification attempts, please try again later',
  keyGenerator: (req) => `${req.ip}-verify-email`, // Rate limit by IP
});

export const refreshTokenLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  message: 'Too many token refresh attempts, please try again later',
  keyGenerator: (req) => `${req.ip}-refresh-token`, // Rate limit by IP
});

export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests, please try again later',
});

// Cleanup function
export const cleanupRateLimiter = async () => {
  await RedisManager.closeAll();
}; 