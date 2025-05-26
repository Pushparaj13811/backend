import { AppError } from '../utils/errors/AppError.js';

export class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * Create a new entity
   * @param {Object} data - Entity data
   * @returns {Promise<Object>} Created entity
   */
  async create(data) {
    return this.repository.create(data);
  }

  /**
   * Get entity by ID
   * @param {string} id - Entity ID
   * @returns {Promise<Object>} Entity
   */
  async getById(id) {
    return this.repository.findById(id);
  }

  /**
   * Get one entity by query
   * @param {Object} query - Query object
   * @returns {Promise<Object>} Entity
   */
  async getOne(query) {
    return this.repository.findOne(query);
  }

  /**
   * Get entities by query
   * @param {Object} query - Query object
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Entities
   */
  async getAll(query = {}, options = {}) {
    return this.repository.find(query, options);
  }

  /**
   * Update entity by ID
   * @param {string} id - Entity ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated entity
   */
  async update(id, updateData) {
    return this.repository.update(id, updateData);
  }

  /**
   * Delete entity by ID
   * @param {string} id - Entity ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    return this.repository.delete(id);
  }

  /**
   * Count entities by query
   * @param {Object} query - Query object
   * @returns {Promise<number>} Count
   */
  async count(query = {}) {
    return this.repository.count(query);
  }

  /**
   * Check if entity exists
   * @param {string} id - Entity ID
   * @returns {Promise<boolean>} Exists
   */
  async exists(id) {
    try {
      await this.repository.findById(id);
      return true;
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Find and update entity
   * @param {Object} query - Query object
   * @param {Object} updateData - Update data
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Updated entity
   */
  async findOneAndUpdate(query, updateData, options = {}) {
    return this.repository.findOneAndUpdate(query, updateData, options);
  }

  /**
   * Find and delete entity
   * @param {Object} query - Query object
   * @returns {Promise<Object>} Deleted entity
   */
  async findOneAndDelete(query) {
    return this.repository.findOneAndDelete(query);
  }
} 