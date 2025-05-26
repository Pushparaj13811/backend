import { BaseRepository } from '../BaseRepository.js';
import { Cart } from '../../models/cart/cart.model.js';

export class CartRepository extends BaseRepository {
  constructor() {
    super(Cart);
  }

  async findByUser(userId) {
    return this.model.find({ user: userId })
      .populate({
        path: 'items.product',
        select: 'name images price stock'
      })
      .populate({
        path: 'items.store',
        select: 'name logo'
      });
  }

  async findActiveByUser(userId) {
    return this.model.findOne({ user: userId, status: 'active' })
      .populate({
        path: 'items.product',
        select: 'name images price stock'
      })
      .populate({
        path: 'items.store',
        select: 'name logo'
      });
  }

  async findByStatus(status) {
    return this.model.find({ status })
      .populate('user', 'name email')
      .populate({
        path: 'items.product',
        select: 'name images price stock'
      })
      .populate({
        path: 'items.store',
        select: 'name logo'
      });
  }

  async updateStatus(id, status) {
    return this.model.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }

  async addItem(id, item) {
    return this.model.findByIdAndUpdate(
      id,
      { $push: { items: item } },
      { new: true }
    );
  }

  async removeItem(id, itemId) {
    return this.model.findByIdAndUpdate(
      id,
      { $pull: { items: { _id: itemId } } },
      { new: true }
    );
  }

  async updateItemQuantity(id, itemId, quantity) {
    return this.model.findOneAndUpdate(
      { _id: id, 'items._id': itemId },
      { $set: { 'items.$.quantity': quantity } },
      { new: true }
    );
  }

  async clearCart(id) {
    return this.model.findByIdAndUpdate(
      id,
      { $set: { items: [] } },
      { new: true }
    );
  }

  async findAbandonedCarts(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    return this.model.find({
      status: 'active',
      lastUpdated: { $lt: date }
    });
  }
} 