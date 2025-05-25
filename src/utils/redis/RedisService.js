import { RedisClientFactory } from './RedisClientFactory.js';
import { logger } from '../logger.js';

export class RedisService {
  constructor(type = 'default') {
    this.client = RedisClientFactory.createClient(type);
  }

  async set(key, value, ttl = null) {
    try {
      if (ttl) {
        await this.client.set(key, value, 'EX', ttl);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error('Redis set error:', error);
      throw error;
    }
  }

  async get(key) {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis get error:', error);
      throw error;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis del error:', error);
      throw error;
    }
  }

  async exists(key) {
    try {
      return await this.client.exists(key);
    } catch (error) {
      logger.error('Redis exists error:', error);
      throw error;
    }
  }

  async expire(key, seconds) {
    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      logger.error('Redis expire error:', error);
      throw error;
    }
  }

  async ttl(key) {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Redis ttl error:', error);
      throw error;
    }
  }

  async incr(key) {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error('Redis incr error:', error);
      throw error;
    }
  }

  async decr(key) {
    try {
      return await this.client.decr(key);
    } catch (error) {
      logger.error('Redis decr error:', error);
      throw error;
    }
  }

  async hset(key, field, value) {
    try {
      await this.client.hset(key, field, value);
      return true;
    } catch (error) {
      logger.error('Redis hset error:', error);
      throw error;
    }
  }

  async hget(key, field) {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      logger.error('Redis hget error:', error);
      throw error;
    }
  }

  async hgetall(key) {
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      logger.error('Redis hgetall error:', error);
      throw error;
    }
  }

  async hdel(key, field) {
    try {
      await this.client.hdel(key, field);
      return true;
    } catch (error) {
      logger.error('Redis hdel error:', error);
      throw error;
    }
  }

  async quit() {
    try {
      await this.client.quit();
      return true;
    } catch (error) {
      logger.error('Redis quit error:', error);
      throw error;
    }
  }

  async flushdb() {
    try {
      await this.client.flushdb();
      return true;
    } catch (error) {
      logger.error('Redis flushdb error:', error);
      throw error;
    }
  }
} 