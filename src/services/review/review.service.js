import { ReviewRepository } from '../../repositories/review/review.repository.js';

export class ReviewService {
  constructor() {
    this.repository = new ReviewRepository();
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

  async findByStore(storeId) {
    return this.repository.findByStore(storeId);
  }

  async findByProduct(productId) {
    return this.repository.findByProduct(productId);
  }

  async findByUser(userId) {
    return this.repository.findByUser(userId);
  }

  async findByStatus(status) {
    return this.repository.findByStatus(status);
  }

  async updateStatus(id, status) {
    return this.repository.updateStatus(id, status);
  }

  async incrementHelpfulVotes(id) {
    return this.repository.incrementHelpfulVotes(id);
  }

  async addLike(id, userId) {
    return this.repository.addLike(id, userId);
  }

  async removeLike(id, userId) {
    return this.repository.removeLike(id, userId);
  }

  async getReviewStats(storeId) {
    const reviews = await this.repository.findByStore(storeId);
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