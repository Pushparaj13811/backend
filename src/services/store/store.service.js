import { StoreRepository } from '../../repositories/store/store.repository.js';
import { ReviewRepository } from '../../repositories/review/review.repository.js';

export class StoreService {
  constructor() {
    this.repository = new StoreRepository();
    this.reviewRepository = new ReviewRepository();
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id) {
    return this.repository.findById(id);
  }

  async create(data) {
    return this.repository.create(data);
  }

  async update(id, data) {
    return this.repository.update(id, data);
  }

  async delete(id) {
    return this.repository.delete(id);
  }

  async findBySlug(slug) {
    return this.repository.findBySlug(slug);
  }

  async findByOwner(ownerId) {
    return this.repository.findByOwner(ownerId);
  }

  async findActive() {
    return this.repository.findActive();
  }

  async findByStatus(status) {
    return this.repository.findByStatus(status);
  }

  async search(query) {
    return this.repository.search(query);
  }

  async updateStatus(id, status) {
    return this.repository.updateStatus(id, status);
  }

  async getStoreStats(id) {
    const store = await this.repository.findById(id);
    if (!store) {
      throw new Error('Store not found');
    }

    const reviews = await this.reviewRepository.findByStore(id);
    const totalRating = reviews.reduce((sum, review) => sum + review.rating.overall, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    return {
      totalReviews: reviews.length,
      averageRating,
      ratingDistribution: this.calculateRatingDistribution(reviews),
      verifiedReviews: reviews.filter(review => review.isVerified).length,
      helpfulReviews: reviews.filter(review => review.helpfulness.helpful > 0).length
    };
  }

  calculateRatingDistribution(reviews) {
    const distribution = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };

    reviews.forEach(review => {
      distribution[review.rating.overall]++;
    });

    return distribution;
  }
}