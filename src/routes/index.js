import express from 'express';
import userRoutes from './user.routes.js';
import categoryRoutes from './category.routes.js';
import productRoutes from './product.routes.js';
import supplierRoutes from './supplier.routes.js';
import warehouseRoutes from './warehouse.routes.js';
import inventoryRoutes from './inventory.routes.js';
import storeRoutes from './store.routes.js';
import reviewRoutes from './review.routes.js';
import cartRoutes from './cart.routes.js';
import wishlistRoutes from './wishlist.routes.js';

const router = express.Router();

// System routes (health check and git info)

// User routes
router.use('/users', userRoutes);

// Category routes
router.use('/categories', categoryRoutes);

// Product routes
router.use('/products', productRoutes);

// Supplier routes
router.use('/suppliers', supplierRoutes);
// Warehouse routes
router.use('/warehouses', warehouseRoutes);
// Inventory routes
router.use('/inventory', inventoryRoutes);

// Store routes
router.use('/stores', storeRoutes);

// Review routes
router.use('/reviews', reviewRoutes);

// Cart routes
router.use('/cart', cartRoutes);

// Wishlist routes
router.use('/wishlists', wishlistRoutes);

export default router;
