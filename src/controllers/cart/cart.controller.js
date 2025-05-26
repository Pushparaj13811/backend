import { CartService } from '../../services/cart/cart.service.js';

export class CartController {
  constructor() {
    this.service = new CartService();
  }

  async findAll(req, res) {
    try {
      const carts = await this.service.findAll();
      res.json(carts);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async findById(req, res) {
    try {
      const cart = await this.service.findById(req.params.id);
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
      res.json(cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async create(req, res) {
    try {
      const cart = await this.service.create({
        ...req.body,
        user: req.user._id,
        createdBy: req.user._id
      });
      res.status(201).json(cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const cart = await this.service.update(req.params.id, {
        ...req.body,
        updatedBy: req.user._id
      });
      res.json(cart);
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
      const carts = await this.service.findByUser(req.user._id);
      res.json(carts);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async findActiveByUser(req, res) {
    try {
      const cart = await this.service.findActiveByUser(req.user._id);
      res.json(cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async findByStatus(req, res) {
    try {
      const carts = await this.service.findByStatus(req.params.status);
      res.json(carts);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const cart = await this.service.updateStatus(req.params.id, req.body.status);
      res.json(cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async addItem(req, res) {
    try {
      const cart = await this.service.addItem(req.params.id, req.body);
      res.json(cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async removeItem(req, res) {
    try {
      const cart = await this.service.removeItem(req.params.id, req.params.itemId);
      res.json(cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateItemQuantity(req, res) {
    try {
      const cart = await this.service.updateItemQuantity(
        req.params.id,
        req.params.itemId,
        req.body.quantity
      );
      res.json(cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async clearCart(req, res) {
    try {
      const cart = await this.service.clearCart(req.params.id);
      res.json(cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async validateCart(req, res) {
    try {
      const cart = await this.service.findById(req.params.id);
      const validation = await this.service.validateCart(cart);
      res.json(validation);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async findAbandonedCarts(req, res) {
    try {
      const carts = await this.service.findAbandonedCarts(req.query.days || 7);
      res.json(carts);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
} 