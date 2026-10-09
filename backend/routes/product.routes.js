import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { adminRoute } from '../middleware/admin.middleware.js';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductStock,
  deleteProduct
} from '../controllers/product.controller.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin routes
router.post('/', protectRoute, adminRoute, createProduct);
router.put('/:id', protectRoute, adminRoute, updateProduct);
router.patch('/:id/stock', protectRoute, adminRoute, toggleProductStock);
router.delete('/:id', protectRoute, adminRoute, deleteProduct);

export default router;
