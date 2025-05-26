import asyncHandler from "express-async-handler";
import { SupplierService } from '../services/SupplierService.js';

export class SupplierController {
  constructor() {
    this.supplierService = new SupplierService();
  }

  create = asyncHandler(async (req, res) => {
    const supplier = await this.supplierService.createSupplier(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: supplier
    });
  });

  update = asyncHandler(async (req, res) => {
    const supplier = await this.supplierService.updateSupplier(
      req.params.id,
      req.body,
      req.user.id
    );
    res.status(200).json({
      success: true,
      data: supplier
    });
  });

  delete = asyncHandler(async (req, res) => {
    await this.supplierService.deleteSupplier(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  });

  getOne = asyncHandler(async (req, res) => {
    const supplier = await this.supplierService.getSupplier(req.params.id);
    res.status(200).json({
      success: true,
      data: supplier
    });
  });

  getAll = asyncHandler(async (req, res) => {
    const suppliers = await this.supplierService.getAllSuppliers(req.query);
    res.status(200).json({
      success: true,
      data: suppliers
    });
  });

  updateStatus = asyncHandler(async (req, res) => {
    const supplier = await this.supplierService.updateSupplierStatus(
      req.params.id,
      req.body.status,
      req.user.id
    );
    res.status(200).json({
      success: true,
      data: supplier
    });
  });

  getActive = asyncHandler(async (req, res) => {
    const suppliers = await this.supplierService.getActiveSuppliers();
    res.status(200).json({
      success: true,
      data: suppliers
    });
  });
} 