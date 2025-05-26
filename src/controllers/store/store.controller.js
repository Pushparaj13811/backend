import { StoreService } from '../../services/store/store.service.js';
import { ReviewService } from '../../services/review/review.service.js';

export class StoreController {
  constructor() {
    this.service = new StoreService();
    this.reviewService = new ReviewService();
  }

  async findAll(req, res) {
    try {
      const stores = await this.service.findAll();
      res.json(stores);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async findById(req, res) {
    try {
      const store = await this.service.findById(req.params.id);
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }
      res.json(store);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async create(req, res) {
    try {
      const store = await this.service.create({
        ...req.body,
        createdBy: req.user._id
      });
      res.status(201).json(store);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const store = await this.service.update(req.params.id, {
        ...req.body,
        updatedBy: req.user._id
      });
      res.json(store);
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

  async findBySlug(req, res) {
    try {
      const store = await this.service.findBySlug(req.params.slug);
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }
      res.json(store);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async findByOwner(req, res) {
    try {
      const stores = await this.service.findByOwner(req.params.ownerId);
      res.json(stores);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async findActive(req, res) {
    try {
      const stores = await this.service.findActive();
      res.json(stores);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async findByStatus(req, res) {
    try {
      const stores = await this.service.findByStatus(req.params.status);
      res.json(stores);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async search(req, res) {
    try {
      const stores = await this.service.search(req.query.q);
      res.json(stores);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const store = await this.service.updateStatus(req.params.id, req.body.status);
      res.json(store);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getStoreStats(req, res) {
    try {
      const stats = await this.service.getStoreStats(req.params.id);
      res.json(stats);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getStoreReviews(req, res) {
    try {
      const reviews = await this.reviewService.findByStore(req.params.id);
      res.json(reviews);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
} 