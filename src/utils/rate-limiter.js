// utils/rate-limiter.js
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { RedisManager } from './redis/RedisManager.js';

// ---------------- utility helpers -------------
const createRedisStore = async (prefix) => {
  const redisClient = RedisManager.getRateLimiterInstance().client;
  if (redisClient.status !== 'ready') {           // ← fixed logical test
    await new Promise((resolve, reject) => {
      redisClient.once('ready', resolve);
      redisClient.once('error', reject);
    });
  }
  return new RedisStore({
    client: redisClient,
    prefix: `rate-limit:${prefix}:`,
    sendCommand: (...args) => redisClient.call(...args),
  });
};

const createRateLimiter = async (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000,
        max = 100,
        message = 'Too many requests from this IP, please try again later.',
        keyGenerator = (req) => req.ip,
        skip = () => false,
        handler = (req, res) => {
            res.status(429).json({
                success: false,
                message
            });
        }
    } = options;

    const store = await createRedisStore(options.prefix || 'default');

    return rateLimit({
        windowMs,
        max,
        message,
        keyGenerator,
        skip,
        handler,
        standardHeaders: true,
        legacyHeaders: false,
        store
    });
};

// ----------------------------------------------

// top-level await – runs once when the module is first imported
export const {
  authLimiter,
  registerLimiter,
  verifyEmailLimiter,
  refreshTokenLimiter,
  generalLimiter,
} = await (async () => {
  const limiters = {
    authLimiter:        await createRateLimiter({ prefix: 'auth',        windowMs: 15 * 60_000, max: 5  }),
    registerLimiter:    await createRateLimiter({ prefix: 'register',    windowMs: 60 * 60_000, max: 3  }),
    verifyEmailLimiter: await createRateLimiter({ prefix: 'verify-email',windowMs: 60 * 60_000, max: 3  }),
    refreshTokenLimiter:await createRateLimiter({ prefix: 'refresh-token',windowMs: 15 * 60_000, max:10 }),
    generalLimiter:     await createRateLimiter({ prefix: 'general',     windowMs: 15 * 60_000, max:100 }),
  };
  console.log('Rate-limiters initialised');
  return limiters;
})();

// Cleanup function for rate limiter resources
export const cleanupRateLimiter = async () => {
    try {
        await RedisManager.closeAll();
        console.log('Rate limiter resources cleaned up successfully');
    } catch (error) {
        console.error('Error cleaning up rate limiter resources:', error);
    }
}; 