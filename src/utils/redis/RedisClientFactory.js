import Redis from 'ioredis';
import { redisConfig } from '../../config/redis.config.js';
import { logger } from '../logger.js';

export class RedisClientFactory {
  static createClient(type = 'default') {
    const env = process.env.NODE_ENV || 'development';
    const config = redisConfig[env];

    if (!config) {
      throw new Error(`Redis configuration not found for environment: ${env}`);
    }

    const client = new Redis({
      ...config,
      keyPrefix: `${config.keyPrefix}${type}:`,
    });

    this.setupEventHandlers(client, type);

    return client;
  }

  static setupEventHandlers(client, type) {
    client.on('connect', () => {
      logger.info(`Redis client ${type} connected successfully`);
    });

    client.on('error', (error) => {
      logger.error(`Redis client ${type} error:`, error);
    });

    client.on('close', () => {
      logger.info(`Redis client ${type} connection closed`);
    });

    client.on('reconnecting', () => {
      logger.info(`Redis client ${type} reconnecting...`);
    });

    client.on('ready', () => {
      logger.info(`Redis client ${type} ready`);
    });
  }
} 