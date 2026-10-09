import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { adminRoute } from '../middleware/admin.middleware.js';
import {
  getCatalogSummary,
  getDrops,
  getDropById,
  createDrop,
  updateDrop,
  updateDropStatus,
  deleteDrop
} from '../controllers/drop.controller.js';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductStock,
  deleteProduct
} from '../controllers/product.controller.js';
import {
  uploadImage,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryWeightRules,
  resetCategories,
  getPrintTypes,
  getPrintPositions
} from '../controllers/catalogue.controller.js';

const router = express.Router();

// Summary & Metadata
router.get('/summary', protectRoute, adminRoute, getCatalogSummary);
router.get('/categories', getCategories);
router.post('/categories', protectRoute, adminRoute, createCategory);
router.put('/categories/rules', protectRoute, adminRoute, updateCategoryWeightRules);
router.post('/categories/reset', protectRoute, adminRoute, resetCategories);
router.put('/categories/:id', protectRoute, adminRoute, updateCategory);
router.delete('/categories/:id', protectRoute, adminRoute, deleteCategory);

router.get('/print-types', getPrintTypes);
router.get('/print-positions', getPrintPositions);

// Uploads
router.post('/upload', protectRoute, adminRoute, uploadImage);

// Drop endpoints under /api/catalogue/drops
router.get('/drops', getDrops);
router.get('/drops/:id', getDropById);
router.post('/drops', protectRoute, adminRoute, createDrop);
router.put('/drops/:id', protectRoute, adminRoute, updateDrop);
router.patch('/drops/:id/status', protectRoute, adminRoute, updateDropStatus);
router.delete('/drops/:id', protectRoute, adminRoute, deleteDrop);

// Product endpoints under /api/catalogue/products & /api/catalogue/drops/:dropId/products
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/drops/:dropId/products', protectRoute, adminRoute, createProduct);
router.post('/products', protectRoute, adminRoute, createProduct);
router.put('/products/:id', protectRoute, adminRoute, updateProduct);
router.patch('/products/:id/stock', protectRoute, adminRoute, toggleProductStock);
router.delete('/products/:id', protectRoute, adminRoute, deleteProduct);

export default router;
