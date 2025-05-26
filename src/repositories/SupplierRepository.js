import { BaseRepository } from './BaseRepository.js';
import Supplier from '../models/supplier/supplier.model.js';

export class SupplierRepository extends BaseRepository {
  constructor() {
    super(Supplier);
  }

  async findByEmail(email) {
    return this.model.findOne({ email });
  }

  async findActiveSuppliers() {
    return this.model.find({ status: 'active' });
  }

  async findSuppliersByStatus(status) {
    return this.model.find({ status });
  }

  async searchSuppliers(query) {
    return this.model.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { 'contactPerson.name': { $regex: query, $options: 'i' } }
      ]
    });
  }

  async updateSupplierStatus(id, status, updatedBy) {
    return this.model.findByIdAndUpdate(
      id,
      { 
        status,
        updatedBy
      },
      { new: true }
    );
  }
} 