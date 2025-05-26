import { BaseRepository } from '../BaseRepository.js';
import { Store } from '../../models/store/store.model.js';

export class StoreRepository extends BaseRepository {
  constructor() {
    super(Store);
  }

  async findBySlug(slug) {
    return this.model.findOne({ slug })
      .populate('owner', 'name email');
  }

  async findByOwner(ownerId) {
    return this.model.find({ owner: ownerId })
      .populate('owner', 'name email');
  }

  async findActive() {
    return this.model.find({ status: 'active' })
      .populate('owner', 'name email');
  }

  async findByStatus(status) {
    return this.model.find({ status })
      .populate('owner', 'name email');
  }

  async search(query) {
    return this.model.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .populate('owner', 'name email');
  }

  async updateStatus(id, status) {
    return this.model.findByIdAndUpdate(
      id,
      { status },
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