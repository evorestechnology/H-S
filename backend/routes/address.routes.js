import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/address.controller.js';

const router = express.Router();

router.route('/')
  .get(protectRoute, getAddresses)
  .post(protectRoute, addAddress);

router.route('/:id')
  .put(protectRoute, updateAddress)
  .delete(protectRoute, deleteAddress);

router.put('/:id/default', protectRoute, setDefaultAddress);

export default router;
