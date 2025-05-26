import { BaseRepository } from './BaseRepository.js';
import Inventory from '../models/inventory/inventory.model.js';

export class InventoryRepository extends BaseRepository {
  constructor() {
    super(Inventory);
  }

  async findByProductAndWarehouse(productId, warehouseId) {
    return this.model.findOne({ product: productId, warehouse: warehouseId });
  }

  async findLowStock() {
    return this.model.findLowStock();
  }

  async findExpired() {
    return this.model.findExpired();
  }

  async findByStatus(status) {
    return this.model.find({ status });
  }

  async findByLocation(warehouseId, location) {
    return this.model.find({
      warehouse: warehouseId,
      'location.aisle': location.aisle,
      'location.rack': location.rack,
      'location.shelf': location.shelf,
      'location.bin': location.bin
    });
  }

  async updateStock(id, quantity, updatedBy) {
    return this.model.findByIdAndUpdate(
      id,
      { 
        quantity,
        updatedBy,
        lastStockCount: {
          date: new Date(),
          quantity,
          discrepancy: 0
        }
      },
      { new: true }
    );
  }

  async updateStatus(id, status, updatedBy) {
    return this.model.findByIdAndUpdate(
      id,
      { 
        status,
        updatedBy
      },
      { new: true }
    );
  }

  async findByBatchNumber(batchNumber) {
    return this.model.find({ batchNumber });
  }

  async findByExpiryDateRange(startDate, endDate) {
    return this.model.find({
      expiryDate: {
        $gte: startDate,
        $lte: endDate
      }
    });
  }

  async getWarehouseInventory(warehouseId) {
    return this.model.find({ warehouse: warehouseId })
      .populate('product')
      .populate('warehouse');
  }

  async getProductInventory(productId) {
    return this.model.find({ product: productId })
      .populate('warehouse');
  }
} 