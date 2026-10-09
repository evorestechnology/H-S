import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getWishlist, toggleWishlist } from '../controllers/wishlist.controller.js';

const router = express.Router();

// All wishlist routes require authentication
router.use(protectRoute);

router.get('/', getWishlist);
router.post('/', toggleWishlist);

export default router;
