import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cart.controller.js';

const router = express.Router();

// All cart routes require authentication
router.use(protectRoute);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:itemId', updateCartItem);
router.delete('/:itemId', removeCartItem);
router.delete('/', clearCart);

export default router;
