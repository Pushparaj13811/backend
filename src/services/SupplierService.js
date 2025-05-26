import { AppError } from '../utils/errors/AppError.js';
import { SupplierRepository } from '../repositories/SupplierRepository.js';

export class SupplierService {
  constructor() {
    this.supplierRepository = new SupplierRepository();
  }

  async createSupplier(supplierData, userId) {
    // Check if supplier with email already exists
    const existingSupplier = await this.supplierRepository.findByEmail(supplierData.email);
    if (existingSupplier) {
      throw new AppError('Supplier with this email already exists', 400);
    }

    // Add createdBy field
    const supplier = await this.supplierRepository.create({
      ...supplierData,
      createdBy: userId
    });

    return supplier;
  }

  async updateSupplier(id, supplierData, userId) {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    // If email is being updated, check for uniqueness
    if (supplierData.email && supplierData.email !== supplier.email) {
      const existingSupplier = await this.supplierRepository.findByEmail(supplierData.email);
      if (existingSupplier) {
        throw new AppError('Supplier with this email already exists', 400);
      }
    }

    const updatedSupplier = await this.supplierRepository.findByIdAndUpdate(
      id,
      {
        ...supplierData,
        updatedBy: userId
      }
    );

    return updatedSupplier;
  }

  async deleteSupplier(id) {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    await this.supplierRepository.findByIdAndDelete(id);
    return { message: 'Supplier deleted successfully' };
  }

  async getSupplier(id) {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }
    return supplier;
  }

  async getAllSuppliers(query = {}) {
    const { status, search } = query;
    let suppliers;

    if (search) {
      suppliers = await this.supplierRepository.searchSuppliers(search);
    } else if (status) {
      suppliers = await this.supplierRepository.findSuppliersByStatus(status);
    } else {
      suppliers = await this.supplierRepository.find();
    }

    return suppliers;
  }

  async updateSupplierStatus(id, status, userId) {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    const updatedSupplier = await this.supplierRepository.updateSupplierStatus(
      id,
      status,
      userId
    );

    return updatedSupplier;
  }

  async getActiveSuppliers() {
    return this.supplierRepository.findActiveSuppliers();
  }
} 