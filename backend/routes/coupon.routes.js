import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { adminRoute } from '../middleware/admin.middleware.js';
import {
  getCoupons,
  getPublicCoupons,
  createCoupon,
  toggleCouponStatus,
  deleteCoupon,
  validateCoupon
} from '../controllers/coupon.controller.js';

const router = express.Router();

// Public coupon listing for checkout display
router.get('/public', getPublicCoupons);

// All coupon endpoints below require authentication
router.use(protectRoute);

// Coupon validation can be used by customers during checkout
router.post('/validate', validateCoupon);

// Administrative coupon management
router.get('/', adminRoute, getCoupons);
router.post('/', adminRoute, createCoupon);
router.patch('/:id/status', adminRoute, toggleCouponStatus);
router.delete('/:id', adminRoute, deleteCoupon);

export default router;

