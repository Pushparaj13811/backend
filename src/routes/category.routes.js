import express from 'express';
import { CategoryController } from '../controllers/CategoryController.js';
import { validateRequest } from '../middlewares/validate-request.js';
import { categoryValidation } from '../validations/category.validation.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { generalLimiter } from '../utils/rate-limiter.js';

const router = express.Router();
const categoryController = new CategoryController();

// Apply general rate limiter to all routes
router.use(generalLimiter);

// Public routes
router.get('/', categoryController.getRootCategories);
router.get('/tree', categoryController.getCategoryTree);
router.get('/:id', categoryController.getById);
router.get('/:id/path', categoryController.getCategoryPath);
router.get('/:id/subcategories', categoryController.getSubcategories);
router.get('/slug/:slug', categoryController.getBySlug);
router.get('/:id/statistics', categoryController.getStatistics);

// Protected routes
router.use(authenticate);

// Admin only routes
router.post(
  '/',
  authorize(['admin']),
  validateRequest(categoryValidation.create),
  categoryController.create
);

router.patch(
  '/:id',
  authorize(['admin']),
  validateRequest(categoryValidation.update),
  categoryController.update
);

router.put(
  '/:id',
  authorize(['admin']),
  validateRequest(categoryValidation.update),
  categoryController.update
);

router.delete(
  '/:id',
  authorize(['admin']),
  categoryController.delete
);

router.patch(
  '/:id/move',
  authorize(['admin']),
  validateRequest(categoryValidation.moveCategory),
  categoryController.moveCategory
);

export default router; 