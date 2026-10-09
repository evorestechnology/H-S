import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { adminRoute } from '../middleware/admin.middleware.js';
import {
  getSettings,
  getPublicSettings,
  getShippingSettings,
  updateShippingSettings,
  updateTaxSettings,
  updateStoreSettings
} from '../controllers/settings.controller.js';

const router = express.Router();

// Public routes
router.get('/public', getPublicSettings);
router.get('/shipping', getShippingSettings);

// Protected Admin routes
router.use(protectRoute);
router.use(adminRoute);

router.get('/', getSettings);
router.put('/tax', updateTaxSettings);
router.put('/store', updateStoreSettings);
router.put('/shipping', updateShippingSettings);

export default router;
