import { ReviewService } from '../../services/review/review.service.js';

export class ReviewController {
  constructor() {
    this.service = new ReviewService();
  }

  async findAll(req, res) {
    try {
      const reviews = await this.service.findAll();
      res.json(reviews);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async findById(req, res) {
    try {
      const review = await this.service.findById(req.params.id);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      res.json(review);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async create(req, res) {
    try {
      const review = await this.service.create({
        ...req.body,
        user: req.user._id,
        createdBy: req.user._id
      });
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const review = await this.service.update(req.params.id, {
        ...req.body,
        updatedBy: req.user._id
      });
      res.json(review);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await this.service.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async findByStore(req, res) {
    try {
      const reviews = await this.service.findByStore(req.params.storeId);
      res.json(reviews);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async findByProduct(req, res) {
    try {
      const reviews = await this.service.findByProduct(req.params.productId);
      res.json(reviews);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async findByUser(req, res) {
    try {
      const reviews = await this.service.findByUser(req.user._id);
      res.json(reviews);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async findByStatus(req, res) {
    try {
      const reviews = await this.service.findByStatus(req.params.status);
      res.json(reviews);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const review = await this.service.updateStatus(req.params.id, req.body.status);
      res.json(review);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async incrementHelpfulVotes(req, res) {
    try {
      const review = await this.service.incrementHelpfulVotes(req.params.id);
      res.json(review);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async addLike(req, res) {
    try {
      const review = await this.service.addLike(req.params.id, req.user._id);
      res.json(review);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async removeLike(req, res) {
    try {
      const review = await this.service.removeLike(req.params.id, req.user._id);
      res.json(review);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getReviewStats(req, res) {
    try {
      const stats = await this.service.getReviewStats(req.params.storeId);
      res.json(stats);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
} 