import { RedisManager } from '../utils/redis/RedisManager.js';

// Get the default Redis instance for OTP operations
export const redisClient = RedisManager.getInstance('otp'); 