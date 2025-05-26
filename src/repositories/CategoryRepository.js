import { BaseRepository } from './BaseRepository.js';
import { Category } from '../models/category/category.model.js';
import { AppError } from '../utils/errors/AppError.js';

export class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Created category
   */
  async create(categoryData) {
    try {
      const category = await Category.create(categoryData);
      
      // Update ancestors if parent is provided
      if (categoryData.parent) {
        const parent = await this.findById(categoryData.parent);
        category.ancestors = [...parent.ancestors, parent._id];
        category.level = parent.level + 1;
        await category.save();
      }
      
      return category;
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError('Category with this name or slug already exists', 400);
      }
      throw error;
    }
  }

  /**
   * Find category by slug
   * @param {string} slug - Category slug
   * @returns {Promise<Object>} Category
   */
  async findBySlug(slug) {
    return this.findOne({ slug });
  }

  /**
   * Find categories by parent
   * @param {string} parentId - Parent category ID
   * @returns {Promise<Array>} Categories
   */
  async findByParent(parentId) {
    return this.find({ parent: parentId });
  }

  /**
   * Find root categories
   * @returns {Promise<Array>} Categories
   */
  async findRootCategories() {
    return this.find({ parent: null });
  }

  /**
   * Get category tree
   * @returns {Promise<Array>} Category tree
   */
  async getCategoryTree() {
    return Category.getCategoryTree();
  }

  /**
   * Update category
   * @param {string} id - Category ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated category
   */
  async update(id, updateData) {
    const category = await Category.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Update ancestors if parent is changed
    if (updateData.parent) {
      const parent = await this.findById(updateData.parent);
      category.ancestors = [...parent.ancestors, parent._id];
      category.level = parent.level + 1;
      await category.save();
    }

    return category;
  }

  /**
   * Delete category
   * @param {string} id - Category ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    // Check if category has children
    const hasChildren = await this.count({ parent: id });
    if (hasChildren > 0) {
      throw new AppError('Cannot delete category with subcategories', 400);
    }

    // Check if category has products
    const hasProducts = await this.model.db.models.Product.countDocuments({ category: id });
    if (hasProducts > 0) {
      throw new AppError('Cannot delete category with associated products', 400);
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
  }

  /**
   * Get category path
   * @param {string} id - Category ID
   * @returns {Promise<Array>} Category path
   */
  async getCategoryPath(id) {
    const category = await this.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const path = await Category.find({
      _id: { $in: [...category.ancestors, category._id] }
    }).sort('level');

    return path;
  }
} 