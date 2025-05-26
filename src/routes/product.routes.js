import express from 'express';
import { ProductController } from '../controllers/ProductController.js';
import { validateRequest } from '../middlewares/validate-request.js';
import { productValidation } from '../validations/product.validation.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { generalLimiter } from '../utils/rate-limiter.js';

const router = express.Router();
const productController = new ProductController();

// Apply general rate limiter to all routes
router.use(generalLimiter);

// Public routes
router.get('/', productController.search);
router.get('/in-stock', productController.getInStock);
router.get('/on-sale', productController.getOnSale);
router.get('/category/:categoryId', productController.getByCategory);
router.get('/status/:status', productController.getByStatus);
router.get('/:id', productController.getById);
router.get('/:id/related', productController.getRelatedProducts);
router.get('/:id/variants', productController.getVariants);
router.get('/slug/:slug', productController.getBySlug);
router.get('/sku/:sku', productController.getBySKU);

// Protected routes
router.use(authenticate);

// Admin only routes
router.post(
  '/',
  authorize(['admin']),
  validateRequest(productValidation.create),
  productController.create
);

router.patch(
  '/:id',
  authorize(['admin']),
  validateRequest(productValidation.update),
  productController.update
);

router.put(
  '/:id',
  authorize(['admin']),
  validateRequest(productValidation.update),
  productController.update
);

router.delete(
  '/:id',
  authorize(['admin']),
  productController.delete
);

router.patch(
  '/:id/inventory',
  authorize(['admin']),
  validateRequest(productValidation.updateInventory),
  productController.updateInventory
);

export default router; 