import { BaseService } from '../BaseService.js';
import { WishlistRepository } from '../../repositories/wishlist/wishlist.repository.js';
import { ProductService } from '../product/product.service.js';
import { CartService } from '../cart/cart.service.js';

export class WishlistService extends BaseService {
  constructor() {
    super(new WishlistRepository());
    this.productService = new ProductService();
    this.cartService = new CartService();
  }

  async create(data) {
    if (data.isDefault) {
      // Unset default for all user's wishlists
      await this.repository.updateMany(
        { user: data.user },
        { isDefault: false }
      );
    }
    return super.create(data);
  }

  async update(id, data) {
    if (data.isDefault) {
      const wishlist = await this.findById(id);
      // Unset default for all user's wishlists
      await this.repository.updateMany(
        { user: wishlist.user },
        { isDefault: false }
      );
    }
    return super.update(id, data);
  }

  async findByUser(userId) {
    return this.repository.findByUser(userId);
  }

  async findDefaultByUser(userId) {
    return this.repository.findDefaultByUser(userId);
  }

  async findPublic() {
    return this.repository.findPublic();
  }

  async addItem(id, item) {
    const product = await this.productService.findById(item.product);
    if (!product) {
      throw new Error('Product not found');
    }

    return this.repository.addItem(id, {
      ...item,
      store: product.store
    });
  }

  async removeItem(id, itemId) {
    return this.repository.removeItem(id, itemId);
  }

  async updateVisibility(id, isPublic) {
    return this.repository.updateVisibility(id, isPublic);
  }

  async setDefault(id, userId) {
    return this.repository.setDefault(id, userId);
  }

  async search(query) {
    return this.repository.search(query);
  }

  async moveToCart(wishlistId, itemId, userId) {
    const wishlist = await this.findById(wishlistId);
    const item = wishlist.items.find(item => item._id.toString() === itemId);
    
    if (!item) {
      throw new Error('Item not found in wishlist');
    }

    // Get or create active cart
    let cart = await this.cartService.findActiveByUser(userId);
    if (!cart) {
      cart = await this.cartService.create({
        user: userId,
        items: []
      });
    }

    // Add item to cart
    await this.cartService.addItem(cart._id, {
      product: item.product,
      store: item.store,
      quantity: 1
    });

    // Remove item from wishlist
    await this.removeItem(wishlistId, itemId);

    return cart;
  }

  async moveAllToCart(wishlistId, userId) {
    const wishlist = await this.findById(wishlistId);
    
    // Get or create active cart
    let cart = await this.cartService.findActiveByUser(userId);
    if (!cart) {
      cart = await this.cartService.create({
        user: userId,
        items: []
      });
    }

    // Add all items to cart
    for (const item of wishlist.items) {
      await this.cartService.addItem(cart._id, {
        product: item.product,
        store: item.store,
        quantity: 1
      });
    }

    // Clear wishlist
    await this.clearWishlist(wishlistId);

    return cart;
  }

  async clearWishlist(id) {
    return this.repository.update(id, { items: [] });
  }
} 