import { WishlistService } from '../../services/wishlist/wishlist.service.js';

export class WishlistController {
  constructor() {
    this.service = new WishlistService();
  }

  async findAll(req, res) {
    try {
      const wishlists = await this.service.findAll();
      res.json(wishlists);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async findById(req, res) {
    try {
      const wishlist = await this.service.findById(req.params.id);
      if (!wishlist) {
        return res.status(404).json({ message: 'Wishlist not found' });
      }
      res.json(wishlist);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async create(req, res) {
    try {
      const wishlist = await this.service.create({
        ...req.body,
        user: req.user._id,
        createdBy: req.user._id
      });
      res.status(201).json(wishlist);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const wishlist = await this.service.update(req.params.id, {
        ...req.body,
        updatedBy: req.user._id
      });
      res.json(wishlist);
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

  async findByUser(req, res) {
    try {
      const wishlists = await this.service.findByUser(req.user._id);
      res.json(wishlists);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async findDefaultByUser(req, res) {
    try {
      const wishlist = await this.service.findDefaultByUser(req.user._id);
      if (!wishlist) {
        return res.status(404).json({ message: 'No default wishlist found' });
      }
      res.json(wishlist);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async findPublic(req, res) {
    try {
      const wishlists = await this.service.findPublic();
      res.json(wishlists);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async addItem(req, res) {
    try {
      const wishlist = await this.service.addItem(req.params.id, req.body);
      res.json(wishlist);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async removeItem(req, res) {
    try {
      const wishlist = await this.service.removeItem(req.params.id, req.params.itemId);
      res.json(wishlist);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateVisibility(req, res) {
    try {
      const wishlist = await this.service.updateVisibility(req.params.id, req.body.isPublic);
      res.json(wishlist);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async setDefault(req, res) {
    try {
      const wishlist = await this.service.setDefault(req.params.id, req.user._id);
      res.json(wishlist);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async search(req, res) {
    try {
      const wishlists = await this.service.search(req.query.q);
      res.json(wishlists);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async moveToCart(req, res) {
    try {
      const cart = await this.service.moveToCart(
        req.params.id,
        req.params.itemId,
        req.user._id
      );
      res.json(cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async moveAllToCart(req, res) {
    try {
      const cart = await this.service.moveAllToCart(req.params.id, req.user._id);
      res.json(cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async clearWishlist(req, res) {
    try {
      const wishlist = await this.service.clearWishlist(req.params.id);
      res.json(wishlist);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
} 