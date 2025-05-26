import asyncHandler from 'express-async-handler';
import { CategoryService } from '../services/CategoryService.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';

export class CategoryController {
  constructor() {
    const categoryRepository = new CategoryRepository();
    this.categoryService = new CategoryService(categoryRepository);
  }

  /**
   * Create a new category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  create = asyncHandler(async (req, res, next) => {
    try {
      const category = await this.categoryService.create(req.body);
      res.status(201).json({
        success: true,
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Get category by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getById = asyncHandler(async (req, res, next) => {
    try {
      const category = await this.categoryService.findById(req.params.id);
      res.status(200).json({
        success: true,
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Get category by slug
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getBySlug = asyncHandler(async (req, res, next) => {
    try {
      const category = await this.categoryService.getBySlug(req.params.slug);
      res.status(200).json({
        success: true,
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Get category tree
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getCategoryTree = asyncHandler(async (req, res, next) => {
    try {
      const tree = await this.categoryService.getCategoryTree();
      res.status(200).json({
        success: true,
        data: { tree }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Get category path
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getCategoryPath = asyncHandler(async (req, res, next) => {
    try {
      const path = await this.categoryService.getCategoryPath(req.params.id);
      res.status(200).json({
        success: true,
        data: { path }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Get subcategories
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getSubcategories = asyncHandler(async (req, res, next) => {
    try {
      const subcategories = await this.categoryService.getSubcategories(req.params.id);
      res.status(200).json({
        success: true,
        data: { subcategories }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Get root categories
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getRootCategories = asyncHandler(async (req, res, next) => {
    try {
      const categories = await this.categoryService.getRootCategories();
      res.status(200).json({
        success: true,
        data: { categories }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Update category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  update = asyncHandler(async (req, res, next) => {
    try {
      const category = await this.categoryService.update(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Delete category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  delete = asyncHandler(async (req, res, next) => {
    try {
      await this.categoryService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Move category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  moveCategory = asyncHandler(async (req, res, next) => {
    try {
      const { newParentId } = req.body;
      const category = await this.categoryService.moveCategory(req.params.id, newParentId);
      res.status(200).json({
        success: true,
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Get category statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getStatistics = asyncHandler(async (req, res, next) => {
    try {
      const statistics = await this.categoryService.getStatistics(req.params.id);
      res.status(200).json({
        success: true,
        data: { statistics }
      });
    } catch (error) {
      next(error);
    }
  });
} 