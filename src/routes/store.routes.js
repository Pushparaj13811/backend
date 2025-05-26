import express from 'express';
import { StoreController } from '../controllers/store/store.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import {validateRequest} from "../middlewares/validate-request.js";
import { storeValidation } from '../validations/store.validation.js';

const router = express.Router();
const storeController = new StoreController();

// Public routes
router.get('/', storeController.findAll.bind(storeController));
router.get('/active', storeController.findActive.bind(storeController));
router.get('/search', storeController.search.bind(storeController));
router.get('/:slug', storeController.findBySlug.bind(storeController));
router.get('/:id/stats', storeController.getStoreStats.bind(storeController));
router.get('/:id/reviews', storeController.getStoreReviews.bind(storeController));

// Protected routes
router.use(authenticate);
router.post('/', validateRequest(storeValidation.create), storeController.create.bind(storeController));
router.patch('/:id', validateRequest(storeValidation.update), storeController.update.bind(storeController));
router.get('/owner/:ownerId', storeController.findByOwner.bind(storeController));
router.get('/status/:status', storeController.findByStatus.bind(storeController));
router.patch('/:id/status', validateRequest(storeValidation.updateStatus), storeController.updateStatus.bind(storeController));

export default router;