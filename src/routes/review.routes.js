import express from 'express';
import { ReviewController } from '../controllers/review/review.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import validateRequest from "../middlewares/validate-request.js"
import { reviewValidation } from '../validations/review.validation.js';

const router = express.Router();
const reviewController = new ReviewController();

// Public routes
router.get('/store/:storeId', reviewController.findByStore.bind(reviewController));
router.get('/product/:productId', reviewController.findByProduct.bind(reviewController));
router.get('/status/:status', reviewController.findByStatus.bind(reviewController));
router.get('/store/:storeId/stats', reviewController.getReviewStats.bind(reviewController));

// Protected routes
router.use(authenticate);
router.post('/', validateRequest(reviewValidation.create), reviewController.create.bind(reviewController));
router.patch('/:id', validateRequest(reviewValidation.update), reviewController.update.bind(reviewController));
router.get('/user', reviewController.findByUser.bind(reviewController));
router.patch('/:id/status', validateRequest(reviewValidation.updateStatus), reviewController.updateStatus.bind(reviewController));
router.post('/:id/helpful', reviewController.incrementHelpfulVotes.bind(reviewController));
router.post('/:id/like', reviewController.addLike.bind(reviewController));
router.delete('/:id/like', reviewController.removeLike.bind(reviewController));

export default router;