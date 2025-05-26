import asyncHandler from "express-async-handler";
import { WarehouseService } from '../services/WarehouseService.js';

export class WarehouseController {
  constructor() {
    this.warehouseService = new WarehouseService();
  }

  create = asyncHandler(async (req, res) => {
    const warehouse = await this.warehouseService.createWarehouse(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: warehouse
    });
  });

  update = asyncHandler(async (req, res) => {
    const warehouse = await this.warehouseService.updateWarehouse(
      req.params.id,
      req.body,
      req.user.id
    );
    res.status(200).json({
      success: true,
      data: warehouse
    });
  });

  delete = asyncHandler(async (req, res) => {
    await this.warehouseService.deleteWarehouse(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Warehouse deleted successfully'
    });
  });

  getOne = asyncHandler(async (req, res) => {
    const warehouse = await this.warehouseService.getWarehouse(req.params.id);
    res.status(200).json({
      success: true,
      data: warehouse
    });
  });

  getAll = asyncHandler(async (req, res) => {
    const warehouses = await this.warehouseService.getAllWarehouses(req.query);
    res.status(200).json({
      success: true,
      data: warehouses
    });
  });

  updateStatus = asyncHandler(async (req, res) => {
    const warehouse = await this.warehouseService.updateWarehouseStatus(
      req.params.id,
      req.body.status,
      req.user.id
    );
    res.status(200).json({
      success: true,
      data: warehouse
    });
  });

  getActive = asyncHandler(async (req, res) => {
    const warehouses = await this.warehouseService.getActiveWarehouses();
    res.status(200).json({
      success: true,
      data: warehouses
    });
  });

  getByType = asyncHandler(async (req, res) => {
    const warehouses = await this.warehouseService.getWarehousesByType(req.params.type);
    res.status(200).json({
      success: true,
      data: warehouses
    });
  });

  getByFeature = asyncHandler(async (req, res) => {
    const warehouses = await this.warehouseService.getWarehousesByFeature(req.params.feature);
    res.status(200).json({
      success: true,
      data: warehouses
    });
  });
} 