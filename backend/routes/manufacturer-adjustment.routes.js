import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { adminRoute } from '../middleware/admin.middleware.js';
import {
  getManufacturerAdjustments,
  createManufacturerAdjustment,
  respondToManufacturerAdjustment,
  payManufacturerAdjustment
} from '../controllers/manufacturer-adjustment.controller.js';

const router = express.Router();
router.use(protectRoute);
router.get('/', getManufacturerAdjustments);
router.post('/', createManufacturerAdjustment);
router.patch('/:id/review', adminRoute, respondToManufacturerAdjustment);
router.post('/:id/pay', adminRoute, payManufacturerAdjustment);

export default router;
