import { BaseService } from '../BaseService.js';
import { CartRepository } from '../../repositories/cart/cart.repository.js';
import { ProductService } from '../product/product.service.js';

export class CartService extends BaseService {
  constructor() {
    super(new CartRepository());
    this.productService = new ProductService();
  }

  async create(data) {
    const cart = await super.create(data);
    await this.calculateTotals(cart);
    return cart;
  }

  async findByUser(userId) {
    return this.repository.findByUser(userId);
  }

  async findActiveByUser(userId) {
    return this.repository.findActiveByUser(userId);
  }

  async findByStatus(status) {
    return this.repository.findByStatus(status);
  }

  async updateStatus(id, status) {
    return this.repository.updateStatus(id, status);
  }

  async addItem(id, item) {
    const product = await this.productService.findById(item.product);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock < item.quantity) {
      throw new Error('Insufficient stock');
    }

    const cart = await this.repository.addItem(id, {
      ...item,
      price: product.price
    });

    await this.calculateTotals(cart);
    return cart;
  }

  async removeItem(id, itemId) {
    const cart = await this.repository.removeItem(id, itemId);
    await this.calculateTotals(cart);
    return cart;
  }

  async updateItemQuantity(id, itemId, quantity) {
    const cart = await this.repository.findById(id);
    const item = cart.items.find(item => item._id.toString() === itemId);
    
    if (!item) {
      throw new Error('Item not found in cart');
    }

    const product = await this.productService.findById(item.product);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    const updatedCart = await this.repository.updateItemQuantity(id, itemId, quantity);
    await this.calculateTotals(updatedCart);
    return updatedCart;
  }

  async clearCart(id) {
    const cart = await this.repository.clearCart(id);
    await this.calculateTotals(cart);
    return cart;
  }

  async findAbandonedCarts(days = 7) {
    return this.repository.findAbandonedCarts(days);
  }

  async calculateTotals(cart) {
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax rate, adjust as needed
    const total = subtotal + tax + cart.shipping - cart.discount;

    return this.repository.update(cart._id, {
      subtotal,
      tax,
      total,
      lastUpdated: new Date()
    });
  }

  async validateCart(cart) {
    const errors = [];
    
    for (const item of cart.items) {
      const product = await this.productService.findById(item.product);
      
      if (!product) {
        errors.push(`Product ${item.product} not found`);
        continue;
      }

      if (product.stock < item.quantity) {
        errors.push(`Insufficient stock for product ${product.name}`);
      }

      if (product.price !== item.price) {
        errors.push(`Price mismatch for product ${product.name}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 