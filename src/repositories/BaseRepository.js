import { AppError } from '../utils/errors/AppError.js';

export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  /**
   * Create a new document
   * @param {Object} data - Document data
   * @returns {Promise<Object>} Created document
   */
  async create(data) {
    try {
      const document = await this.model.create(data);
      return document;
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError('Duplicate entry', 400);
      }
      throw error;
    }
  }

  /**
   * Find document by ID
   * @param {string} id - Document ID
   * @returns {Promise<Object>} Document
   */
  async findById(id) {
    const document = await this.model.findById(id);
    if (!document) {
      throw new AppError('Document not found', 404);
    }
    return document;
  }

  /**
   * Find one document by query
   * @param {Object} query - Query object
   * @returns {Query} Mongoose query object
   */
  findOne(query) {
    return this.model.findOne(query);
  }

  /**
   * Find documents by query
   * @param {Object} query - Query object
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Documents
   */
  async find(query = {}, options = {}) {
    return this.model.find(query, null, options);
  }

  /**
   * Update document by ID
   * @param {string} id - Document ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated document
   */
  async update(id, updateData) {
    const document = await this.model.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    return document;
  }

  /**
   * Delete document by ID
   * @param {string} id - Document ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    const document = await this.model.findByIdAndDelete(id);
    if (!document) {
      throw new AppError('Document not found', 404);
    }
  }

  /**
   * Count documents by query
   * @param {Object} query - Query object
   * @returns {Promise<number>} Count
   */
  async count(query = {}) {
    return this.model.countDocuments(query);
  }

  /**
   * Find and update document
   * @param {Object} query - Query object
   * @param {Object} updateData - Update data
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Updated document
   */
  async findOneAndUpdate(query, updateData, options = {}) {
    return this.model.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true, runValidators: true, ...options }
    );
  }

  /**
   * Find and delete document
   * @param {Object} query - Query object
   * @returns {Promise<Object>} Deleted document
   */
  async findOneAndDelete(query) {
    return this.model.findOneAndDelete(query);
  }
} 