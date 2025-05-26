import express from 'express';
import { WishlistController } from '../controllers/wishlist/wishlist.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import validateRequest from "../middlewares/validate-request.js"
import { wishlistValidation } from '../validations/wishlist.validation.js';

const router = express.Router();
const wishlistController = new WishlistController();

// Public routes
router.get('/public', wishlistController.findPublic.bind(wishlistController));
router.get('/search', wishlistController.search.bind(wishlistController));

// Protected routes
router.use(authenticate);

// Wishlist management
router.post('/', validateRequest(wishlistValidation.create), wishlistController.create.bind(wishlistController));
router.patch('/:id', validateRequest(wishlistValidation.update), wishlistController.update.bind(wishlistController));
router.get('/user', wishlistController.findByUser.bind(wishlistController));
router.get('/user/default', wishlistController.findDefaultByUser.bind(wishlistController));
router.patch('/:id/visibility', validateRequest(wishlistValidation.updateVisibility), wishlistController.updateVisibility.bind(wishlistController));
router.patch('/:id/default', wishlistController.setDefault.bind(wishlistController));

// Wishlist items management
router.post('/:id/items', validateRequest(wishlistValidation.addItem), wishlistController.addItem.bind(wishlistController));
router.delete('/:id/items/:itemId', wishlistController.removeItem.bind(wishlistController));
router.delete('/:id/items', wishlistController.clearWishlist.bind(wishlistController));

// Move items to cart
router.post('/:id/items/:itemId/move-to-cart', wishlistController.moveToCart.bind(wishlistController));
router.post('/:id/move-all-to-cart', wishlistController.moveAllToCart.bind(wishlistController));

export default router; 