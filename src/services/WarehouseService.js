import { AppError } from '../utils/errors/AppError.js';
import { WarehouseRepository } from '../repositories/WarehouseRepository.js';

export class WarehouseService {
  constructor() {
    this.warehouseRepository = new WarehouseRepository();
  }

  async createWarehouse(warehouseData, userId) {
    // Check if warehouse with code already exists
    const existingWarehouse = await this.warehouseRepository.findByCode(warehouseData.code);
    if (existingWarehouse) {
      throw new AppError('Warehouse with this code already exists', 400);
    }

    // Add createdBy field
    const warehouse = await this.warehouseRepository.create({
      ...warehouseData,
      createdBy: userId
    });

    return warehouse;
  }

  async updateWarehouse(id, warehouseData, userId) {
    const warehouse = await this.warehouseRepository.findById(id);
    if (!warehouse) {
      throw new AppError('Warehouse not found', 404);
    }

    // If code is being updated, check for uniqueness
    if (warehouseData.code && warehouseData.code !== warehouse.code) {
      const existingWarehouse = await this.warehouseRepository.findByCode(warehouseData.code);
      if (existingWarehouse) {
        throw new AppError('Warehouse with this code already exists', 400);
      }
    }

    const updatedWarehouse = await this.warehouseRepository.findByIdAndUpdate(
      id,
      {
        ...warehouseData,
        updatedBy: userId
      }
    );

    return updatedWarehouse;
  }

  async deleteWarehouse(id) {
    const warehouse = await this.warehouseRepository.findById(id);
    if (!warehouse) {
      throw new AppError('Warehouse not found', 404);
    }

    await this.warehouseRepository.findByIdAndDelete(id);
    return { message: 'Warehouse deleted successfully' };
  }

  async getWarehouse(id) {
    const warehouse = await this.warehouseRepository.findById(id);
    if (!warehouse) {
      throw new AppError('Warehouse not found', 404);
    }
    return warehouse;
  }

  async getAllWarehouses(query = {}) {
    const { status, type, search, feature, minCapacity, unit } = query;
    let warehouses;

    if (search) {
      warehouses = await this.warehouseRepository.searchWarehouses(search);
    } else if (status) {
      warehouses = await this.warehouseRepository.findWarehousesByStatus(status);
    } else if (type) {
      warehouses = await this.warehouseRepository.findWarehousesByType(type);
    } else if (feature) {
      warehouses = await this.warehouseRepository.findWarehousesByFeature(feature);
    } else if (minCapacity && unit) {
      warehouses = await this.warehouseRepository.findWarehousesByCapacity(minCapacity, unit);
    } else {
      warehouses = await this.warehouseRepository.find();
    }

    return warehouses;
  }

  async updateWarehouseStatus(id, status, userId) {
    const warehouse = await this.warehouseRepository.findById(id);
    if (!warehouse) {
      throw new AppError('Warehouse not found', 404);
    }

    const updatedWarehouse = await this.warehouseRepository.updateWarehouseStatus(
      id,
      status,
      userId
    );

    return updatedWarehouse;
  }

  async getActiveWarehouses() {
    return this.warehouseRepository.findActiveWarehouses();
  }

  async getWarehousesByType(type) {
    return this.warehouseRepository.findWarehousesByType(type);
  }

  async getWarehousesByFeature(feature) {
    return this.warehouseRepository.findWarehousesByFeature(feature);
  }
} 