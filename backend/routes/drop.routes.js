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

const router = express.Router();

// Public routes
router.get('/', getDrops);
router.get('/:id', getDropById);

// Admin routes
router.get('/summary', protectRoute, adminRoute, getCatalogSummary);
router.post('/', protectRoute, adminRoute, createDrop);
router.put('/:id', protectRoute, adminRoute, updateDrop);
router.patch('/:id/status', protectRoute, adminRoute, updateDropStatus);
router.delete('/:id', protectRoute, adminRoute, deleteDrop);

export default router;
