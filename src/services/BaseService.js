import { AppError } from '../utils/errors/AppError.js';

export class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(data) {
    try {
      return await this.repository.create(data);
    } catch (error) {
      throw new AppError('Error creating resource', 500);
    }
  }

  async getById(id) {
    const resource = await this.repository.findById(id);
    if (!resource) {
      throw new AppError('Resource not found', 404);
    }
    return resource;
  }

  async getOne(filter) {
    const resource = await this.repository.findOne(filter);
    if (!resource) {
      throw new AppError('Resource not found', 404);
    }
    return resource;
  }

  async getAll(filter = {}, options = {}) {
    try {
      return await this.repository.find(filter, options);
    } catch (error) {
      throw new AppError('Error fetching resources', 500);
    }
  }

  async update(id, data) {
    const resource = await this.repository.update(id, data);
    if (!resource) {
      throw new AppError('Resource not found', 404);
    }
    return resource;
  }

  async delete(id) {
    const resource = await this.repository.delete(id);
    if (!resource) {
      throw new AppError('Resource not found', 404);
    }
    return resource;
  }

  async exists(filter) {
    return await this.repository.exists(filter);
  }

  async count(filter = {}) {
    return await this.repository.count(filter);
  }
} 