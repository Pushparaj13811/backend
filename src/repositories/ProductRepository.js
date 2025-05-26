import { BaseRepository } from './BaseRepository.js';
import { Product } from '../models/product/product.model.js';
import { AppError } from '../utils/errors/AppError.js';

export class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product
   */
  async create(productData) {
    try {
      const product = await Product.create(productData);
      return product;
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError('Product with this name or SKU already exists', 400);
      }
      throw error;
    }
  }

  /**
   * Find product by slug
   * @param {string} slug - Product slug
   * @returns {Promise<Object>} Product
   */
  async findBySlug(slug) {
    return this.findOne({ slug });
  }

  /**
   * Find product by SKU
   * @param {string} sku - Product SKU
   * @returns {Promise<Object>} Product
   */
  async findBySKU(sku) {
    return this.findOne({ 'inventory.sku': sku });
  }

  /**
   * Find products by category
   * @param {string} categoryId - Category ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Products
   */
  async findByCategory(categoryId, options = {}) {
    return this.find({ category: categoryId }, options);
  }

  /**
   * Find products by status
   * @param {string} status - Product status
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Products
   */
  async findByStatus(status, options = {}) {
    return this.find({ status }, options);
  }

  /**
   * Find products in stock
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Products
   */
  async findInStock(options = {}) {
    return this.find({ 'inventory.quantity.available': { $gt: 0 } }, options);
  }

  /**
   * Find products on sale
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Products
   */
  async findOnSale(options = {}) {
    return this.find({ 'pricing.salePrice': { $exists: true, $ne: null } }, options);
  }

  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Products
   */
  async search(query, options = {}) {
    return this.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { 'inventory.sku': { $regex: query, $options: 'i' } }
      ]
    }, options);
  }

  /**
   * Update product
   * @param {string} id - Product ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated product
   */
  async update(id, updateData) {
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  /**
   * Update product inventory
   * @param {string} id - Product ID
   * @param {number} quantity - Quantity to update
   * @param {string} type - Inventory type (available, reserved, damaged, expired)
   * @returns {Promise<Object>} Updated product
   */
  async updateInventory(id, quantity, type = 'available') {
    const product = await this.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    await product.updateInventory(quantity, type);
    return product;
  }

  /**
   * Delete product
   * @param {string} id - Product ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
  }

  /**
   * Get related products
   * @param {string} id - Product ID
   * @param {number} limit - Number of related products to return
   * @returns {Promise<Array>} Related products
   */
  async getRelatedProducts(id, limit = 4) {
    const product = await this.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return this.find({
      _id: { $ne: id },
      category: product.category,
      status: 'active'
    }).limit(limit);
  }

  /**
   * Get product variants
   * @param {string} id - Product ID
   * @returns {Promise<Array>} Product variants
   */
  async getVariants(id) {
    const product = await this.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product.variants;
  }
} 