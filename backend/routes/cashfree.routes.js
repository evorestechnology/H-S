import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  createPaymentSession,
  verifyPayment,
  handleWebhook
} from '../controllers/cashfree.controller.js';

const router = express.Router();

// Cashfree Payment Session & Server Verification
router.post('/create-session', protectRoute, createPaymentSession);
router.post('/verify', protectRoute, verifyPayment);

// Webhook endpoint (Signature verified)
router.post('/webhook', handleWebhook);

export default router;
