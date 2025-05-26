import { AppError } from '../utils/errors/AppError.js';
import { InventoryRepository } from '../repositories/InventoryRepository.js';
import { ProductRepository } from '../repositories/ProductRepository.js';
import { WarehouseRepository } from '../repositories/WarehouseRepository.js';

export class InventoryService {
  constructor() {
    this.inventoryRepository = new InventoryRepository();
    this.productRepository = new ProductRepository();
    this.warehouseRepository = new WarehouseRepository();
  }

  async createInventoryItem(inventoryData, userId) {
    // Validate product exists
    const product = await this.productRepository.findById(inventoryData.product);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Validate warehouse exists
    const warehouse = await this.warehouseRepository.findById(inventoryData.warehouse);
    if (!warehouse) {
      throw new AppError('Warehouse not found', 404);
    }

    // Check if inventory item already exists for this product and warehouse
    const existingInventory = await this.inventoryRepository.findByProductAndWarehouse(
      inventoryData.product,
      inventoryData.warehouse
    );
    if (existingInventory) {
      throw new AppError('Inventory item already exists for this product in the warehouse', 400);
    }

    // Add createdBy field
    const inventory = await this.inventoryRepository.create({
      ...inventoryData,
      createdBy: userId
    });

    return inventory;
  }

  async updateInventoryItem(id, inventoryData, userId) {
    const inventory = await this.inventoryRepository.findById(id);
    if (!inventory) {
      throw new AppError('Inventory item not found', 404);
    }

    // If product or warehouse is being updated, check for uniqueness
    if (
      (inventoryData.product && inventoryData.product !== inventory.product.toString()) ||
      (inventoryData.warehouse && inventoryData.warehouse !== inventory.warehouse.toString())
    ) {
      const existingInventory = await this.inventoryRepository.findByProductAndWarehouse(
        inventoryData.product || inventory.product,
        inventoryData.warehouse || inventory.warehouse
      );
      if (existingInventory && existingInventory._id.toString() !== id) {
        throw new AppError('Inventory item already exists for this product in the warehouse', 400);
      }
    }

    const updatedInventory = await this.inventoryRepository.findByIdAndUpdate(
      id,
      {
        ...inventoryData,
        updatedBy: userId
      }
    );

    return updatedInventory;
  }

  async deleteInventoryItem(id) {
    const inventory = await this.inventoryRepository.findById(id);
    if (!inventory) {
      throw new AppError('Inventory item not found', 404);
    }

    await this.inventoryRepository.findByIdAndDelete(id);
    return { message: 'Inventory item deleted successfully' };
  }

  async getInventoryItem(id) {
    const inventory = await this.inventoryRepository.findById(id);
    if (!inventory) {
      throw new AppError('Inventory item not found', 404);
    }
    return inventory;
  }

  async getAllInventoryItems(query = {}) {
    const { status, search, batchNumber, expiryDateStart, expiryDateEnd } = query;
    let inventoryItems;

    if (search) {
      inventoryItems = await this.inventoryRepository.searchInventory(search);
    } else if (status) {
      inventoryItems = await this.inventoryRepository.findByStatus(status);
    } else if (batchNumber) {
      inventoryItems = await this.inventoryRepository.findByBatchNumber(batchNumber);
    } else if (expiryDateStart && expiryDateEnd) {
      inventoryItems = await this.inventoryRepository.findByExpiryDateRange(
        new Date(expiryDateStart),
        new Date(expiryDateEnd)
      );
    } else {
      inventoryItems = await this.inventoryRepository.find();
    }

    return inventoryItems;
  }

  async updateStock(id, quantity, userId) {
    const inventory = await this.inventoryRepository.findById(id);
    if (!inventory) {
      throw new AppError('Inventory item not found', 404);
    }

    const updatedInventory = await this.inventoryRepository.updateStock(
      id,
      quantity,
      userId
    );

    return updatedInventory;
  }

  async updateStatus(id, status, userId) {
    const inventory = await this.inventoryRepository.findById(id);
    if (!inventory) {
      throw new AppError('Inventory item not found', 404);
    }

    const updatedInventory = await this.inventoryRepository.updateStatus(
      id,
      status,
      userId
    );

    return updatedInventory;
  }

  async getLowStockItems() {
    return this.inventoryRepository.findLowStock();
  }

  async getExpiredItems() {
    return this.inventoryRepository.findExpired();
  }

  async getWarehouseInventory(warehouseId) {
    const warehouse = await this.warehouseRepository.findById(warehouseId);
    if (!warehouse) {
      throw new AppError('Warehouse not found', 404);
    }

    return this.inventoryRepository.getWarehouseInventory(warehouseId);
  }

  async getProductInventory(productId) {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return this.inventoryRepository.getProductInventory(productId);
  }

  async findByLocation(warehouseId, location) {
    const warehouse = await this.warehouseRepository.findById(warehouseId);
    if (!warehouse) {
      throw new AppError('Warehouse not found', 404);
    }

    return this.inventoryRepository.findByLocation(warehouseId, location);
  }
} 