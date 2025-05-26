import express from 'express';
import { WarehouseController } from '../controllers/WarehouseController.js';
import { validateRequest } from '../middlewares/validate-request.js';
import { warehouseValidation } from '../validations/warehouse.validation.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { generalLimiter } from '../utils/rate-limiter.js';

const router = express.Router();
const warehouseController = new WarehouseController();

// Apply general rate limiter to all routes
router.use(generalLimiter);

// Public routes
router.get('/', warehouseController.getAll);
router.get('/active', warehouseController.getActive);
router.get('/type/:type', warehouseController.getByType);
router.get('/feature/:feature', warehouseController.getByFeature);
router.get('/:id', warehouseController.getOne);

// Protected routes
router.use(authenticate);

// Admin only routes
router.post(
  '/',
  authorize(['admin']),
  validateRequest(warehouseValidation.create),
  warehouseController.create
);

router.patch(
  '/:id',
  authorize(['admin']),
  validateRequest(warehouseValidation.update),
  warehouseController.update
);

router.put(
  '/:id',
  authorize(['admin']),
  validateRequest(warehouseValidation.update),
  warehouseController.update
);

router.delete(
  '/:id',
  authorize(['admin']),
  warehouseController.delete
);

router.patch(
  '/:id/status',
  authorize(['admin']),
  validateRequest(warehouseValidation.updateStatus),
  warehouseController.updateStatus
);

export default router; 