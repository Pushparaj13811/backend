import { RedisService } from './RedisService.js';
import { logger } from '../logger.js';

export class RedisManager {
  static #instances = new Map();

  static getInstance(type = 'default') {
    if (!this.#instances.has(type)) {
      this.#instances.set(type, new RedisService(type));
    }
    return this.#instances.get(type);
  }

  static async closeAll() {
    const closePromises = Array.from(this.#instances.values()).map(
      async (instance) => {
        try {
          await instance.quit();
          logger.info(`Redis instance ${instance.constructor.name} closed successfully`);
        } catch (error) {
          logger.error(`Error closing Redis instance ${instance.constructor.name}:`, error);
        }
      }
    );

    await Promise.all(closePromises);
    this.#instances.clear();
  }

  static getRateLimiterInstance() {
    return this.getInstance('rate-limiter');
  }

  static getCacheInstance() {
    return this.getInstance('cache');
  }

  static getSessionInstance() {
    return this.getInstance('session');
  }

  static getQueueInstance() {
    return this.getInstance('queue');
  }
} 