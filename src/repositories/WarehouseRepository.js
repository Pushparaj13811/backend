import { BaseRepository } from './BaseRepository.js';
import {Warehouse} from '../models/warehouse/warehouse.model.js';

export class WarehouseRepository extends BaseRepository {
  constructor() {
    super(Warehouse);
  }

  async findByCode(code) {
    return this.model.findOne({ code });
  }

  async findActiveWarehouses() {
    return this.model.find({ status: 'active' });
  }

  async findWarehousesByType(type) {
    return this.model.find({ type });
  }

  async findWarehousesByStatus(status) {
    return this.model.find({ status });
  }

  async searchWarehouses(query) {
    return this.model.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { code: { $regex: query, $options: 'i' } },
        { 'address.city': { $regex: query, $options: 'i' } },
        { 'address.state': { $regex: query, $options: 'i' } }
      ]
    });
  }

  async updateWarehouseStatus(id, status, updatedBy) {
    return this.model.findByIdAndUpdate(
      id,
      { 
        status,
        updatedBy
      },
      { new: true }
    );
  }

  async findWarehousesByFeature(feature) {
    return this.model.find({ features: feature });
  }

  async findWarehousesByCapacity(minCapacity, unit) {
    return this.model.find({
      'capacity.total': { $gte: minCapacity },
      'capacity.unit': unit
    });
  }
} 