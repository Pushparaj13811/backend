import { Router } from 'express';
import userRoutes from './user.routes.js';
import systemRoutes from './system.routes.js';

const router = Router();

// System routes (health check and git info)
router.use('/system', systemRoutes);

// User routes
router.use('/users', userRoutes);

export default router;
