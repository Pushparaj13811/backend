import asyncHandler from 'express-async-handler';
import { ProductService } from '../services/ProductService.js';
import { ProductRepository } from '../repositories/ProductRepository.js';

export class ProductController {
  constructor() {
    const productRepository = new ProductRepository();
    this.productService = new ProductService(productRepository);
  }

  /**
   * Create a new product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  create = asyncHandler(async (req, res, next) => {
    try {
      const product = await this.productService.create(req.body);
      res.status(201).json({
        success: true,
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Get product by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getById = asyncHandler(async (req, res, next) => {
    try {
      const product = await this.productService.findById(req.params.id);
      // Update view count
      await this.productService.updateAnalytics(req.params.id, 'view');
      res.status(200).json({
        success: true,
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Get product by slug
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getBySlug = asyncHandler(async (req, res, next) => {
    try {
      const product = await this.productService.getBySlug(req.params.slug);
      // Update view count
      await this.productService.updateAnalytics(product._id, 'view');
      res.status(200).json({
        success: true,
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Get product by SKU
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getBySKU = asyncHandler(async (req, res, next) => {
    try {
      const product = await this.productService.getBySKU(req.params.sku);
      res.status(200).json({
        success: true,
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Get products by category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getByCategory = asyncHandler(async (req, res, next) => {
    try {
      const products = await this.productService.getByCategory(req.params.categoryId, req.query);
      res.status(200).json({
        success: true,
        data: { products }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Get products by status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getByStatus = asyncHandler(async (req, res, next) => {
    try {
      const products = await this.productService.getByStatus(req.params.status, req.query);
      res.status(200).json({
        success: true,
        data: { products }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Get in-stock products
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getInStock = asyncHandler(async (req, res, next) => {
    try {
      const products = await this.productService.getInStock(req.query);
      res.status(200).json({
        success: true,
        data: { products }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Get on-sale products
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getOnSale = asyncHandler(async (req, res, next) => {
    try {
      const products = await this.productService.getOnSale(req.query);
      res.status(200).json({
        success: true,
        data: { products }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Search products
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  search = asyncHandler(async (req, res, next) => {
    try {
      const products = await this.productService.search(req.query.q, req.query);
      res.status(200).json({
        success: true,
        data: { products }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Update product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  update = asyncHandler(async (req, res, next) => {
    try {
      const product = await this.productService.update(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Update product inventory
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  updateInventory = asyncHandler(async (req, res, next) => {
    try {
      const product = await this.productService.updateInventory(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Delete product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  delete = asyncHandler(async (req, res, next) => {
    try {
      await this.productService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Get related products
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getRelatedProducts = asyncHandler(async (req, res, next) => {
    try {
      const products = await this.productService.getRelatedProducts(req.params.id, req.query);
      res.status(200).json({
        success: true,
        data: { products }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Get product variants
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getVariants = asyncHandler(async (req, res, next) => {
    try {
      const variants = await this.productService.getVariants(req.params.id);
      res.status(200).json({
        success: true,
        data: { variants }
      });
    } catch (error) {
      next(error);
    }
  });
} 