import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { adminRoute } from '../middleware/admin.middleware.js';
import { getDashboardStats } from '../controllers/dashboard.controller.js';

const router = express.Router();

// Protected dashboard routes
router.get('/stats', protectRoute, adminRoute, getDashboardStats);

export default router;
