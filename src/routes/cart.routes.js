import express from 'express';
import { CartController } from '../controllers/cart/cart.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import validateRequest from "../middlewares/validate-request.js"
import { cartValidation } from '../validations/cart.validation.js';

const router = express.Router();
const cartController = new CartController();

// All cart routes require authentication
router.use(authenticate);

// Cart management
router.post('/', validateRequest(cartValidation.create), cartController.create.bind(cartController));
router.patch('/:id', validateRequest(cartValidation.update), cartController.update.bind(cartController));
router.get('/user', cartController.findByUser.bind(cartController));
router.get('/user/active', cartController.findActiveByUser.bind(cartController));
router.get('/status/:status', cartController.findByStatus.bind(cartController));
router.patch('/:id/status', validateRequest(cartValidation.updateStatus), cartController.updateStatus.bind(cartController));

// Cart items management
router.post('/:id/items', validateRequest(cartValidation.addItem), cartController.addItem.bind(cartController));
router.delete('/:id/items/:itemId', cartController.removeItem.bind(cartController));
router.patch('/:id/items/:itemId/quantity', validateRequest(cartValidation.updateQuantity), cartController.updateItemQuantity.bind(cartController));
router.delete('/:id/items', cartController.clearCart.bind(cartController));

// Cart validation
router.get('/:id/validate', cartController.validateCart.bind(cartController));

// Admin routes
router.get('/abandoned', cartController.findAbandonedCarts.bind(cartController));

export default router;