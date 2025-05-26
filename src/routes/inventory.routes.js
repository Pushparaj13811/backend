import express from 'express';
import { InventoryController } from '../controllers/InventoryController.js';
import { validateRequest } from '../middlewares/validate-request.js';
import { inventoryValidation } from '../validations/inventory.validation.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { generalLimiter } from '../utils/rate-limiter.js';

const router = express.Router();
const inventoryController = new InventoryController();

// Apply general rate limiter to all routes
router.use(generalLimiter);

// Public routes
router.get('/', inventoryController.getAll);
router.get('/low-stock', inventoryController.getLowStock);
router.get('/expired', inventoryController.getExpired);
router.get('/warehouse/:warehouseId', inventoryController.getWarehouseInventory);
router.get('/product/:productId', inventoryController.getProductInventory);
router.get('/:id', inventoryController.getOne);

// Protected routes
router.use(authenticate);

// Admin only routes
router.post(
  '/',
  authorize(['admin']),
  validateRequest(inventoryValidation.create),
  inventoryController.create
);

router.patch(
  '/:id',
  authorize(['admin']),
  validateRequest(inventoryValidation.update),
  inventoryController.update
);

router.put(
  '/:id',
  authorize(['admin']),
  validateRequest(inventoryValidation.update),
  inventoryController.update
);

router.delete(
  '/:id',
  authorize(['admin']),
  inventoryController.delete
);

router.patch(
  '/:id/stock',
  authorize(['admin']),
  validateRequest(inventoryValidation.updateStock),
  inventoryController.updateStock
);

router.patch(
  '/:id/status',
  authorize(['admin']),
  validateRequest(inventoryValidation.updateStatus),
  inventoryController.updateStatus
);

router.post(
  '/warehouse/:warehouseId/location',
  authorize(['admin']),
  validateRequest(inventoryValidation.findByLocation),
  inventoryController.findByLocation
);

export default router; 