import { BaseRepository } from '../BaseRepository.js';
import { Wishlist } from '../../models/wishlist/wishlist.model.js';

export class WishlistRepository extends BaseRepository {
  constructor() {
    super(Wishlist);
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

  async findDefaultByUser(userId) {
    return this.model.findOne({ user: userId, isDefault: true })
      .populate({
        path: 'items.product',
        select: 'name images price stock'
      })
      .populate({
        path: 'items.store',
        select: 'name logo'
      });
  }

  async findPublic() {
    return this.model.find({ isPublic: true })
      .populate('user', 'name')
      .populate({
        path: 'items.product',
        select: 'name images price stock'
      })
      .populate({
        path: 'items.store',
        select: 'name logo'
      });
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

  async updateVisibility(id, isPublic) {
    return this.model.findByIdAndUpdate(
      id,
      { isPublic },
      { new: true }
    );
  }

  async setDefault(id, userId) {
    // First, unset default for all user's wishlists
    await this.model.updateMany(
      { user: userId },
      { isDefault: false }
    );

    // Then set the specified wishlist as default
    return this.model.findByIdAndUpdate(
      id,
      { isDefault: true },
      { new: true }
    );
  }

  async search(query) {
    return this.model.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ],
      isPublic: true
    }).populate('user', 'name');
  }
} 