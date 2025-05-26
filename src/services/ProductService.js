import { BaseService } from './BaseService.js';
import { AppError } from '../utils/errors/AppError.js';
import slugify from 'slugify';

export class ProductService extends BaseService {
  constructor(productRepository) {
    super(productRepository);
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product
   */
  async create(productData) {
    // Generate slug from name
    productData.slug = slugify(productData.name, { lower: true });

    // Create product
    const product = await this.repository.create(productData);

    // Update category product count
    if (product.category) {
      const Category = this.repository.model.db.models.Category;
      const category = await Category.findById(product.category);
      if (category) {
        await category.updateProductCount();
      }
    }

    return product;
  }

  /**
   * Get product by slug
   * @param {string} slug - Product slug
   * @returns {Promise<Object>} Product
   */
  async getBySlug(slug) {
    const product = await this.repository.findBySlug(slug);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  /**
   * Get product by SKU
   * @param {string} sku - Product SKU
   * @returns {Promise<Object>} Product
   */
  async getBySKU(sku) {
    const product = await this.repository.findBySKU(sku);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  /**
   * Get products by category
   * @param {string} categoryId - Category ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Products
   */
  async getByCategory(categoryId, options = {}) {
    return this.repository.findByCategory(categoryId, options);
  }

  /**
   * Get products by status
   * @param {string} status - Product status
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Products
   */
  async getByStatus(status, options = {}) {
    return this.repository.findByStatus(status, options);
  }

  /**
   * Get in-stock products
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Products
   */
  async getInStock(options = {}) {
    return this.repository.findInStock(options);
  }

  /**
   * Get on-sale products
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Products
   */
  async getOnSale(options = {}) {
    return this.repository.findOnSale(options);
  }

  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Products
   */
  async search(query, options = {}) {
    return this.repository.search(query, options);
  }

  /**
   * Update product
   * @param {string} id - Product ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated product
   */
  async update(id, updateData) {
    // Generate new slug if name is updated
    if (updateData.name) {
      updateData.slug = slugify(updateData.name, { lower: true });
    }

    const product = await this.repository.update(id, updateData);

    // Update category product count if category changed
    if (updateData.category) {
      const Category = this.repository.model.db.models.Category;
      const [oldCategory, newCategory] = await Promise.all([
        Category.findById(product.category),
        Category.findById(updateData.category)
      ]);

      if (oldCategory) {
        await oldCategory.updateProductCount();
      }
      if (newCategory) {
        await newCategory.updateProductCount();
      }
    }

    return product;
  }

  /**
   * Update product inventory
   * @param {string} id - Product ID
   * @param {Object} inventoryData - Inventory data
   * @returns {Promise<Object>} Updated product
   */
  async updateInventory(id, inventoryData) {
    return this.repository.updateInventory(id, inventoryData);
  }

  /**
   * Delete product
   * @param {string} id - Product ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Update category product count
    if (product.category) {
      const Category = this.repository.model.db.models.Category;
      const category = await Category.findById(product.category);
      if (category) {
        await category.updateProductCount();
      }
    }

    await this.repository.delete(id);
  }

  /**
   * Get related products
   * @param {string} id - Product ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Related products
   */
  async getRelatedProducts(id, options = {}) {
    return this.repository.getRelatedProducts(id, options);
  }

  /**
   * Get product variants
   * @param {string} id - Product ID
   * @returns {Promise<Array>} Product variants
   */
  async getVariants(id) {
    return this.repository.getVariants(id);
  }

  /**
   * Update product analytics
   * @param {string} id - Product ID
   * @param {string} type - Analytics type (view, purchase, review)
   * @returns {Promise<Object>} Updated product
   */
  async updateAnalytics(id, type) {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    await product.updateAnalytics(type);
    return product;
  }
} 