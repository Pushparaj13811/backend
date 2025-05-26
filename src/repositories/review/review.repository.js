import { BaseRepository } from '../BaseRepository.js';
import { Review } from '../../models/review/review.model.js';

export class ReviewRepository extends BaseRepository {
  constructor() {
    super(Review);
  }

  async findByStore(storeId) {
    return this.model.find({ store: storeId })
      .populate('user', 'name email')
      .populate('product', 'name images');
  }

  async findByProduct(productId) {
    return this.model.find({ product: productId })
      .populate('user', 'name email')
      .populate('store', 'name logo');
  }

  async findByUser(userId) {
    return this.model.find({ user: userId })
      .populate('store', 'name logo')
      .populate('product', 'name images');
  }

  async findByStatus(status) {
    return this.model.find({ status })
      .populate('user', 'name email')
      .populate('store', 'name logo')
      .populate('product', 'name images');
  }

  async updateStatus(id, status) {
    return this.model.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }

  async incrementHelpfulVotes(id) {
    return this.model.findByIdAndUpdate(
      id,
      { $inc: { helpfulVotes: 1 } },
      { new: true }
    );
  }

  async addLike(id, userId) {
    return this.model.findByIdAndUpdate(
      id,
      { $addToSet: { likes: userId } },
      { new: true }
    );
  }

  async removeLike(id, userId) {
    return this.model.findByIdAndUpdate(
      id,
      { $pull: { likes: userId } },
      { new: true }
    );
  }

  async getAverageRating(storeId) {
    const result = await this.model.aggregate([
      { $match: { store: storeId, status: 'approved' } },
      { $group: { _id: null, averageRating: { $avg: '$rating' } } }
    ]);
    return result[0]?.averageRating || 0;
  }
} 