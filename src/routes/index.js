import { Router } from 'express';
import userRoutes from './user.routes.js';
import systemRoutes from './system.routes.js';
import categoryRoutes from './category.routes.js';
import productRoutes from './product.routes.js';

const router = Router();

// System routes (health check and git info)
router.use('/system', systemRoutes);

// User routes
router.use('/users', userRoutes);

// Category routes
router.use('/categories', categoryRoutes);

// Product routes
router.use('/products', productRoutes);

export default router;
