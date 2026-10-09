import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { adminRoute } from '../middleware/admin.middleware.js';
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  createUser,
  updateUserStatus,
  updateUserDetails,
  deleteUser,
  getManufacturers
} from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', protectRoute, adminRoute, getAllUsers);
router.get('/manufacturers', protectRoute, getManufacturers);
router.post('/', protectRoute, adminRoute, createUser);
router.get('/profile', protectRoute, getUserProfile);
router.put('/profile', protectRoute, updateUserProfile);
router.patch('/:id/status', protectRoute, adminRoute, updateUserStatus);
router.put('/:id', protectRoute, adminRoute, updateUserDetails);
router.delete('/:id', protectRoute, adminRoute, deleteUser);

export default router;
