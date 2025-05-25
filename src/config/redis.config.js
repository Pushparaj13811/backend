import env from './env.js';

export const redisConfig = {
  development: {
    host: 'localhost',
    port: 6379,
    password: env.REDIS_PASSWORD,
    db: 0,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: false,
    connectTimeout: 10000,
    commandTimeout: 5000,
    keepAlive: 30000,
    family: 4, // IPv4
    keyPrefix: 'dev:',
  },
  test: {
    host: 'localhost',
    port: 6379,
    password: env.REDIS_PASSWORD,
    db: 1, // Use different DB for tests
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: false,
    connectTimeout: 10000,
    commandTimeout: 5000,
    keepAlive: 30000,
    family: 4,
    keyPrefix: 'test:',
  },
  production: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: 0,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: false,
    connectTimeout: 10000,
    commandTimeout: 5000,
    keepAlive: 30000,
    family: 4,
    keyPrefix: 'prod:',
    tls: {
      rejectUnauthorized: false
    }
  }
}; 