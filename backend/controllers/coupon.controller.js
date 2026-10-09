import { prisma } from '../lib/prisma.js';
import { initCustomTables } from '../services/dbInit.service.js';

// @desc    Get all coupons from database
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res) => {
  try {
    await initCustomTables();

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const formattedCoupons = coupons.map(c => ({
      id: c.id,
      code: c.code,
      type: c.type,
      discountValue: Number(c.discountValue) || 0,
      discountType: c.discountType,
      minSpend: Number(c.minSpend) || 0,
      usageLimit: Number(c.usageLimit) || 0,
      usageCount: Number(c.usageCount) || 0,
      expiryDate: c.expiryDate || '2026-12-31',
      status: c.status,
      createdAt: c.createdAt ? c.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }));

    const summary = {
      totalCoupons: formattedCoupons.length,
      publicCoupons: formattedCoupons.filter(c => c.type === 'Public').length,
      privateCoupons: formattedCoupons.filter(c => c.type === 'Private').length,
      activeCoupons: formattedCoupons.filter(c => c.status === 'Active').length
    };

    return res.status(200).json({
      success: true,
      message: 'Coupons retrieved successfully',
      summary,
      coupons: formattedCoupons
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve coupons from database',
      summary: { totalCoupons: 0, publicCoupons: 0, privateCoupons: 0, activeCoupons: 0 },
      coupons: []
    });
  }
};

// @desc    Create a new coupon in database
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  try {
    await initCustomTables();

    const {
      code,
      type = 'Public',
      discountValue = 10,
      discountType = 'Percentage',
      minSpend = 0,
      usageLimit = 0,
      expiryDate = '2026-12-31'
    } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check for duplicate code
    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Coupon code '${cleanCode}' already exists.`
      });
    }

    const id = `CPN-${Date.now().toString().slice(-6)}`;

    const created = await prisma.coupon.create({
      data: {
        id,
        code: cleanCode,
        type,
        discountValue: Number(discountValue) || 0,
        discountType,
        minSpend: Number(minSpend) || 0,
        usageLimit: Number(usageLimit) || 0,
        usageCount: 0,
        expiryDate: expiryDate || '2026-12-31',
        status: 'Active'
      }
    });

    const formatted = {
      ...created,
      createdAt: created.createdAt ? created.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    };

    return res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon: formatted,
      ...formatted
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create coupon in database'
    });
  }
};

// @desc    Toggle or update coupon status
// @route   PATCH /api/coupons/:id/status
// @access  Private/Admin
export const toggleCouponStatus = async (req, res) => {
  try {
    await initCustomTables();
    const { id } = req.params;
    const { status } = req.body;

    const existing = await prisma.coupon.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const newStatus = status || (existing.status === 'Active' ? 'Disabled' : 'Active');

    const updated = await prisma.coupon.update({
      where: { id },
      data: { status: newStatus }
    });

    return res.status(200).json({
      success: true,
      message: `Coupon status updated to ${newStatus}`,
      status: newStatus,
      coupon: updated
    });
  } catch (error) {
    console.error('Error toggling coupon status:', error);
    return res.status(500).json({ success: false, message: 'Failed to toggle coupon status' });
  }
};

// @desc    Validate coupon code and return authoritative discount
// @route   POST /api/coupons/validate
// @access  Private (Authenticated users)
export const validateCoupon = async (req, res) => {
  try {
    await initCustomTables();
    const { code, amount = 0 } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({ where: { code: cleanCode } });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (coupon.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'This coupon is currently inactive or disabled' });
    }

    if (coupon.expiryDate) {
      const expiry = new Date(coupon.expiryDate);
      expiry.setHours(23, 59, 59, 999);
      if (expiry < new Date()) {
        return res.status(400).json({ success: false, message: 'This coupon has expired' });
      }
    }

    const orderAmt = Number(amount) || 0;
    if (coupon.minSpend > 0 && orderAmt < coupon.minSpend) {
      return res.status(400).json({
        success: false,
        message: `Minimum spend of ₹${coupon.minSpend.toLocaleString('en-IN')} required to apply this coupon`
      });
    }

    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit has been reached' });
    }

    let discount = 0;
    if (coupon.discountType === 'Percentage') {
      discount = (orderAmt * coupon.discountValue) / 100;
    } else {
      discount = Math.min(orderAmt, coupon.discountValue);
    }

    return res.status(200).json({
      success: true,
      message: 'Coupon is valid and applied',
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Number(discount.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return res.status(500).json({ success: false, message: 'Server error validating coupon' });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  try {
    await initCustomTables();
    const { id } = req.params;

    const existing = await prisma.coupon.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    await prisma.coupon.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete coupon' });
  }
};

// @desc    Get active public coupons for checkout display
// @route   GET /api/coupons/public
// @access  Public
export const getPublicCoupons = async (req, res) => {
  try {
    await initCustomTables();

    const coupons = await prisma.coupon.findMany({
      where: {
        type: 'Public',
        status: 'Active'
      },
      orderBy: { createdAt: 'desc' }
    });

    const activePublicCoupons = coupons
      .filter(c => {
        if (c.expiryDate) {
          const expiry = new Date(c.expiryDate);
          expiry.setHours(23, 59, 59, 999);
          if (expiry < new Date()) return false;
        }
        if (c.usageLimit > 0 && c.usageCount >= c.usageLimit) return false;
        return true;
      })
      .map(c => ({
        id: c.id,
        code: c.code,
        discountType: c.discountType,
        discountValue: Number(c.discountValue) || 0,
        minSpend: Number(c.minSpend) || 0,
        expiryDate: c.expiryDate
      }));

    return res.status(200).json({
      success: true,
      coupons: activePublicCoupons
    });
  } catch (error) {
    console.error('Error fetching public coupons:', error);
    return res.status(500).json({ success: false, coupons: [] });
  }
};
