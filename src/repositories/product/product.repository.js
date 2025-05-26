import { Product } from '../../models/product/product.model.js';
import { BaseRepository } from '../BaseRepository.js';

export class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  async findByStore(storeId) {
    return this.model.find({ store: storeId })
      .populate('store', 'name')
      .populate('category', 'name');
  }

  async findByCategory(categoryId) {
    return this.model.find({ category: categoryId })
      .populate('store', 'name')
      .populate('category', 'name');
  }

  async findByStatus(status) {
    return this.model.find({ status })
      .populate('store', 'name')
      .populate('category', 'name');
  }

  async search(query) {
    return this.model.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .populate('store', 'name')
      .populate('category', 'name');
  }

  async updateStatus(id, status) {
    return this.model.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }

  async updateStock(id, quantity) {
    return this.model.findByIdAndUpdate(
      id,
      { $inc: { stock: quantity } },
      { new: true }
    );
  }

  async updateRating(id, rating) {
    return this.model.findByIdAndUpdate(
      id,
      { 
        'rating.average': rating,
        'rating.count': await this.model.countDocuments({ _id: id })
      },
      { new: true }
    );
  }
} 