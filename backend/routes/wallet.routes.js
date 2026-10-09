import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { adminRoute } from '../middleware/admin.middleware.js';
import {
  getMfgWalletMetrics,
  getMfgWalletEarnings,
  getAdminWalletMetrics,
  getAdminWalletTransactions,
  markAdminTransactionPaid,
  toggleAdminTransactionAdjustment
} from '../controllers/wallet.controller.js';

const router = express.Router();

// All wallet routes require authentication
router.use(protectRoute);

// Manufacturer Wallet Routes
router.get('/mfg/metrics', getMfgWalletMetrics);
router.get('/mfg/earnings', getMfgWalletEarnings);

// Admin Wallet Routes
router.get('/admin/metrics', adminRoute, getAdminWalletMetrics);
router.get('/admin/transactions', adminRoute, getAdminWalletTransactions);
router.post('/admin/transactions/:id/pay', adminRoute, markAdminTransactionPaid);
router.post('/admin/transactions/:id/toggle-adjustment', adminRoute, toggleAdminTransactionAdjustment);

export default router;
