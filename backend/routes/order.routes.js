import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  getAllOrders,
  createOrder,
  shipOrder,
  completeOrder,
  cancelOrder,
  requestPriceAdjustment,
  respondToPriceAdjustment,
  requestOrderCancellation,
  respondToCancelRequest,
  updateMfgPaymentStatus,
  getOrderById,
  getMyOrders
} from '../controllers/order.controller.js';

const router = express.Router();

// All order routes require authentication
router.use(protectRoute);

router.get('/', getAllOrders);
router.post('/', createOrder);
router.post('/checkout', createOrder);
router.get('/myorders', getMyOrders);

router.put('/:id/ship', shipOrder);
router.patch('/:id/complete', completeOrder);
router.patch('/:id/cancel', cancelOrder);

// Price adjustment routes (Manufacturer requests, Admin responds)
router.post('/:id/price-adjustment', requestPriceAdjustment);
router.patch('/:id/price-adjustment', respondToPriceAdjustment);

// Cancellation request routes (Manufacturer requests, Admin responds)
router.post('/:id/cancel-request', requestOrderCancellation);
router.patch('/:id/cancel-request', respondToCancelRequest);

// Manufacturer payment payout status (Admin updates)
router.patch('/:id/mfg-payment-status', updateMfgPaymentStatus);

// Specific order details (Keep :id at the bottom)
router.get('/:id', getOrderById);

export default router;
