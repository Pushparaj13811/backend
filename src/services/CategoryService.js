import { BaseService } from './BaseService.js';
import { AppError } from '../utils/errors/AppError.js';
import slugify from 'slugify';

export class CategoryService extends BaseService {
  constructor(categoryRepository) {
    super(categoryRepository);
  }

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Created category
   */
  async create(categoryData) {
    // Generate slug from name
    categoryData.slug = slugify(categoryData.name, { lower: true });

    // Create category
    const category = await this.repository.create(categoryData);

    // Update product count
    await category.updateProductCount();

    return category;
  }

  /**
   * Get category by slug
   * @param {string} slug - Category slug
   * @returns {Promise<Object>} Category
   */
  async getBySlug(slug) {
    const category = await this.repository.findBySlug(slug);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return category;
  }

  /**
   * Get category tree
   * @returns {Promise<Array>} Category tree
   */
  async getCategoryTree() {
    return this.repository.getCategoryTree();
  }

  /**
   * Get category path
   * @param {string} id - Category ID
   * @returns {Promise<Array>} Category path
   */
  async getCategoryPath(id) {
    return this.repository.getCategoryPath(id);
  }

  /**
   * Get subcategories
   * @param {string} id - Category ID
   * @returns {Promise<Array>} Subcategories
   */
  async getSubcategories(id) {
    return this.repository.findByParent(id);
  }

  /**
   * Get root categories
   * @returns {Promise<Array>} Root categories
   */
  async getRootCategories() {
    return this.repository.findRootCategories();
  }

  /**
   * Update category
   * @param {string} id - Category ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated category
   */
  async update(id, updateData) {
    // Generate new slug if name is updated
    if (updateData.name) {
      updateData.slug = slugify(updateData.name, { lower: true });
    }

    const category = await this.repository.update(id, updateData);

    // Update product count
    await category.updateProductCount();

    return category;
  }

  /**
   * Delete category
   * @param {string} id - Category ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    await this.repository.delete(id);
  }

  /**
   * Move category
   * @param {string} id - Category ID
   * @param {string} newParentId - New parent category ID
   * @returns {Promise<Object>} Updated category
   */
  async moveCategory(id, newParentId) {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Check if new parent exists
    if (newParentId) {
      const newParent = await this.repository.findById(newParentId);
      if (!newParent) {
        throw new AppError('New parent category not found', 404);
      }

      // Check for circular reference
      if (newParent.ancestors.includes(id)) {
        throw new AppError('Cannot move category to its own subcategory', 400);
      }
    }

    // Update category
    const updateData = {
      parent: newParentId || null
    };

    return this.update(id, updateData);
  }

  /**
   * Get category statistics
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Category statistics
   */
  async getStatistics(id) {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const [productCount, subcategoryCount] = await Promise.all([
      this.repository.model.db.models.Product.countDocuments({ category: id }),
      this.repository.count({ parent: id })
    ]);

    return {
      productCount,
      subcategoryCount,
      level: category.level,
      path: await this.getCategoryPath(id)
    };
  }
} 