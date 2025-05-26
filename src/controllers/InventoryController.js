import asyncHandler from "express-async-handler";
import { InventoryService } from '../services/InventoryService.js';

export class InventoryController {
  constructor() {
    this.inventoryService = new InventoryService();
  }

  create = asyncHandler(async (req, res) => {
    const inventory = await this.inventoryService.createInventoryItem(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: inventory
    });
  });

  update = asyncHandler(async (req, res) => {
    const inventory = await this.inventoryService.updateInventoryItem(
      req.params.id,
      req.body,
      req.user.id
    );
    res.status(200).json({
      success: true,
      data: inventory
    });
  });

  delete = asyncHandler(async (req, res) => {
    await this.inventoryService.deleteInventoryItem(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  });

  getOne = asyncHandler(async (req, res) => {
    const inventory = await this.inventoryService.getInventoryItem(req.params.id);
    res.status(200).json({
      success: true,
      data: inventory
    });
  });

  getAll = asyncHandler(async (req, res) => {
    const inventoryItems = await this.inventoryService.getAllInventoryItems(req.query);
    res.status(200).json({
      success: true,
      data: inventoryItems
    });
  });

  updateStock = asyncHandler(async (req, res) => {
    const inventory = await this.inventoryService.updateStock(
      req.params.id,
      req.body.quantity,
      req.user.id
    );
    res.status(200).json({
      success: true,
      data: inventory
    });
  });

  updateStatus = asyncHandler(async (req, res) => {
    const inventory = await this.inventoryService.updateStatus(
      req.params.id,
      req.body.status,
      req.user.id
    );
    res.status(200).json({
      success: true,
      data: inventory
    });
  });

  getLowStock = asyncHandler(async (req, res) => {
    const inventoryItems = await this.inventoryService.getLowStockItems();
    res.status(200).json({
      success: true,
      data: inventoryItems
    });
  });

  getExpired = asyncHandler(async (req, res) => {
    const inventoryItems = await this.inventoryService.getExpiredItems();
    res.status(200).json({
      success: true,
      data: inventoryItems
    });
  });

  getWarehouseInventory = asyncHandler(async (req, res) => {
    const inventoryItems = await this.inventoryService.getWarehouseInventory(req.params.warehouseId);
    res.status(200).json({
      success: true,
      data: inventoryItems
    });
  });

  getProductInventory = asyncHandler(async (req, res) => {
    const inventoryItems = await this.inventoryService.getProductInventory(req.params.productId);
    res.status(200).json({
      success: true,
      data: inventoryItems
    });
  });

  findByLocation = asyncHandler(async (req, res) => {
    const inventoryItems = await this.inventoryService.findByLocation(
      req.params.warehouseId,
      req.body.location
    );
    res.status(200).json({
      success: true,
      data: inventoryItems
    });
  });
} 