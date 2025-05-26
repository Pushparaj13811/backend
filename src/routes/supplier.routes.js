import express from 'express';
import { SupplierController } from '../controllers/SupplierController.js';
import { validateRequest } from '../middlewares/validate-request.js';
import { supplierValidation } from '../validations/supplier.validation.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { generalLimiter } from '../utils/rate-limiter.js';

const router = express.Router();
const supplierController = new SupplierController();

// Apply general rate limiter to all routes
router.use(generalLimiter);

// Public routes
router.get('/', supplierController.getAll);
router.get('/active', supplierController.getActive);
router.get('/:id', supplierController.getOne);

// Protected routes
router.use(authenticate);

// Admin only routes
router.post(
  '/',
  authorize(['admin']),
  validateRequest(supplierValidation.create),
  supplierController.create
);

router.patch(
  '/:id',
  authorize(['admin']),
  validateRequest(supplierValidation.update),
  supplierController.update
);

router.put(
  '/:id',
  authorize(['admin']),
  validateRequest(supplierValidation.update),
  supplierController.update
);

router.delete(
  '/:id',
  authorize(['admin']),
  supplierController.delete
);

router.patch(
  '/:id/status',
  authorize(['admin']),
  validateRequest(supplierValidation.updateStatus),
  supplierController.updateStatus
);

export default router; 