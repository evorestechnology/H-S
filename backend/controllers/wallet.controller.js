import { prisma } from '../lib/prisma.js';
import { resolveColorAssets } from '../services/order.service.js';

// Helper to resolve an order by UUID or TXN- prefix
const findOrderByIdOrTxn = async (txnOrOrderId) => {
  let order = await prisma.order.findUnique({
    where: { id: txnOrOrderId },
    include: {
      user: { select: { fullName: true, email: true } },
      manufacturer: { select: { companyName: true, fullName: true } }
    }
  });

  if (!order && txnOrOrderId.startsWith('TXN-')) {
    const rawIdPrefix = txnOrOrderId.replace('TXN-', '').toLowerCase();
    order = await prisma.order.findFirst({
      where: {
        id: { startsWith: rawIdPrefix, mode: 'insensitive' }
      },
      include: {
        user: { select: { fullName: true, email: true } },
        manufacturer: { select: { companyName: true, fullName: true } }
      }
    });
  }

  return order;
};

// Helper to compute accurate mfg payment from order record or catalog manufacturePrice
const computeOrderMfgPayment = (order) => {
  if (!order || order.status === 'CANCELED' || order.status === 'CANCELLED' || order.cancelRequested) {
    return 0;
  }

  // Calculate base manufacturing payment from items
  let baseMfg = 0;
  if (Array.isArray(order.items) && order.items.length > 0) {
    for (const it of order.items) {
      const itColorAssets = resolveColorAssets(it.product || {}, it.color);
      const matched = itColorAssets.matchedColor;
      const colorMfgPrice = (matched && typeof matched.manufacturePrice === 'number' && matched.manufacturePrice > 0)
        ? matched.manufacturePrice
        : null;
      const colorBreakdownTotal = (matched && (typeof matched.baseCost === 'number' || typeof matched.printingCost === 'number'))
        ? ((Number(matched.baseCost) || 0) + (Number(matched.printingCost) || 0) + (Number(matched.shippingCost) || 0) + (Number(matched.additionalCost) || 0))
        : 0;
      const targetColorMfg = colorMfgPrice || (colorBreakdownTotal > 0 ? colorBreakdownTotal : null);

      const unitMfg = targetColorMfg
        || ((typeof it.product?.manufacturePrice === 'number' && it.product.manufacturePrice > 0)
          ? it.product.manufacturePrice
          : 0);
      baseMfg += unitMfg * (it.quantity || 1);
    }
  }

  const isApproved = order.priceAdjustmentStatus === 'Approved';
  const adjustment = (isApproved && Number(order.priceAdjustmentAmount) > 0) ? Number(order.priceAdjustmentAmount) : 0;

  if (baseMfg > 0) {
    // Adjustment is strictly per-order (+₹100 once), NEVER per-item
    return Number((baseMfg + adjustment).toFixed(2));
  }

  // Fallback to order.mfgPayment if items could not be loaded
  if (typeof order.mfgPayment === 'number' && order.mfgPayment > 0) {
    return Number(order.mfgPayment.toFixed(2));
  }

  return 0;
};

// ==========================================
// MANUFACTURER WALLET ENDPOINTS
// ==========================================

// @desc    Get Manufacturer Wallet Metrics
// @route   GET /api/wallet/mfg/metrics
// @access  Private (Manufacturer / Admin)
export const getMfgWalletMetrics = async (req, res) => {
  try {
    const userRole = (req.user?.role || '').toUpperCase();

    // Enforce role authorization: USER is forbidden from manufacturer metrics
    if (userRole !== 'MANUFACTURER' && userRole !== 'ADMIN' && userRole !== 'ADMINISTRATOR') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Access restricted to Manufacturers and Administrators',
        data: null
      });
    }

    const whereConditions = [
      { status: { not: 'CANCELED' } },
      { cancelRequested: false }
    ];

    if (userRole === 'MANUFACTURER' && req.user?.id) {
      whereConditions.push({
        OR: [
          { manufacturerId: req.user.id },
          { manufacturerId: null }
        ]
      });
    }

    const [orders, adjustments] = await Promise.all([
      prisma.order.findMany({
      where: {
        AND: whereConditions
      },
      include: {
        items: {
          select: {
            id: true,
            name: true,
            size: true,
            color: true,
            quantity: true,
            price: true,
            product: {
              select: {
                id: true,
                price: true,
                manufacturePrice: true,
                colors: true,
                priceBreakdown: true
              }
            }
          }
        }
      }
      }),
      prisma.manufacturerAdjustment.findMany({
        where: {
          ...(userRole === 'MANUFACTURER' ? { manufacturerId: req.user.id } : {}),
          status: 'APPROVED'
        }
      })
    ]);

    let lifetimeEarnings = 0;
    let approvedAdjustmentsTotal = 0;
    let pendingPayouts = 0;
    let paidPayouts = 0;

    orders.forEach(order => {
      const payment = computeOrderMfgPayment(order);
      lifetimeEarnings += payment;

      if (order.priceAdjustmentStatus === 'Approved' && order.priceAdjustmentAmount) {
        approvedAdjustmentsTotal += order.priceAdjustmentAmount;
      }

      if (order.mfgPaymentStatus === 'Paid') {
        paidPayouts += payment;
      } else {
        pendingPayouts += payment;
      }
    });
    adjustments.forEach(adjustment => {
      lifetimeEarnings += Number(adjustment.amount) || 0;
      approvedAdjustmentsTotal += Number(adjustment.amount) || 0;
      if (adjustment.paymentStatus === 'PAID') paidPayouts += Number(adjustment.amount) || 0;
      else pendingPayouts += Number(adjustment.amount) || 0;
    });

    const metricsData = {
      walletBalance: Number(paidPayouts.toFixed(2)),
      lifetimeEarnings: Number(lifetimeEarnings.toFixed(2)),
      approvedAdjustmentsTotal: Number(approvedAdjustmentsTotal.toFixed(2)),
      pendingPayouts: Number(pendingPayouts.toFixed(2)),
      paidPayouts: Number(paidPayouts.toFixed(2))
    };

    res.json({
      success: true,
      message: 'Manufacturer wallet metrics retrieved successfully',
      data: metricsData,
      ...metricsData
    });
  } catch (error) {
    console.error('Error computing mfg wallet metrics:', error.message);
    res.status(500).json({ success: false, message: 'Failed to compute wallet metrics' });
  }
};

// @desc    Get Manufacturer Earning Records (Wallet Table)
// @route   GET /api/wallet/mfg/earnings
// @access  Private (Manufacturer / Admin)
export const getMfgWalletEarnings = async (req, res) => {
  try {
    const userRole = (req.user?.role || '').toUpperCase();

    // Enforce role authorization: USER is forbidden from manufacturer earnings
    if (userRole !== 'MANUFACTURER' && userRole !== 'ADMIN' && userRole !== 'ADMINISTRATOR') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Access restricted to Manufacturers and Administrators',
        data: null
      });
    }

    const whereConditions = [
      { status: { not: 'CANCELED' } },
      { cancelRequested: false }
    ];

    if (userRole === 'MANUFACTURER' && req.user?.id) {
      whereConditions.push({
        OR: [
          { manufacturerId: req.user.id },
          { manufacturerId: null }
        ]
      });
    }

    const [orders, adjustments] = await Promise.all([
      prisma.order.findMany({
      where: {
        AND: whereConditions
      },
      include: {
        items: {
          select: {
            id: true,
            name: true,
            size: true,
            color: true,
            quantity: true,
            price: true,
            product: {
              select: {
                id: true,
                price: true,
                manufacturePrice: true,
                colors: true,
                priceBreakdown: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
      }),
      prisma.manufacturerAdjustment.findMany({
        where: {
          ...(userRole === 'MANUFACTURER' ? { manufacturerId: req.user.id } : {}),
          status: { in: ['PENDING', 'APPROVED', 'REJECTED'] }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const earnings = orders.map((order, idx) => {
      const firstItem = order.items?.[0] || {};
      const payment = computeOrderMfgPayment(order);
      const adjStatus = order.priceAdjustmentStatus || 'None';
      const isAdjusted = Boolean(adjStatus === 'Approved' && order.priceAdjustmentAmount && order.priceAdjustmentAmount > 0);

      return {
        id: `REC-${100 + idx + 1}`,
        orderId: order.id,
        orderedDate: order.createdAt
          ? new Date(order.createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
          : new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }),
        itemName: (Array.isArray(order.items) && order.items.length > 1)
          ? order.items.map(i => `${i.quantity > 1 ? `${i.quantity}x ` : ''}${i.name || 'Athletic Wear'}`).join(', ')
          : (firstItem.name || 'Athletic Wear'),
        size: (Array.isArray(order.items) && order.items.length > 1)
          ? order.items.map(i => i.size).filter(Boolean).join(', ')
          : (firstItem.size || 'L'),
        color: (Array.isArray(order.items) && order.items.length > 1)
          ? order.items.map(i => i.color).filter(Boolean).join(', ')
          : (firstItem.color || 'Default'),
        manufacturerPayment: payment,
        isAdjusted,
        adjustmentStatus: adjStatus,
        priceAdjustmentStatus: adjStatus,
        adjustmentAmount: order.priceAdjustmentAmount || 0,
        adjustmentReason: order.priceAdjustmentReason || null,
        paymentStatus: order.mfgPaymentStatus === 'Paid' ? 'Paid' : 'Not Paid',
        paidDate: order.mfgPaidDate || null
      };
    });

    const adjustmentEarnings = adjustments.map((adjustment, idx) => ({
      id: `ADJ-${adjustment.id.slice(0, 8).toUpperCase()}`,
      orderId: 'Other adjustment',
      orderedDate: adjustment.createdAt
        ? new Date(adjustment.createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
        : new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }),
      itemName: 'Other manufacturer adjustment',
      size: '-',
      color: '-',
      manufacturerPayment: adjustment.status === 'APPROVED' ? Number(adjustment.amount) : 0,
      isAdjusted: true,
      isOtherAdjustment: true,
      adjustmentStatus: adjustment.status,
      priceAdjustmentStatus: adjustment.status,
      adjustmentAmount: Number(adjustment.amount),
      adjustmentReason: adjustment.reason,
      paymentStatus: adjustment.paymentStatus === 'PAID' ? 'Paid' : 'Not Paid',
      paidDate: adjustment.paidAt || null
    }));

    res.json([...earnings, ...adjustmentEarnings]);
  } catch (error) {
    console.error('Error fetching mfg earnings:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch earning records' });
  }
};

// ==========================================
// ADMIN WALLET ENDPOINTS (DATABASE BACKED)
// ==========================================

// @desc    Get Admin Wallet Financial Metrics
// @route   GET /api/wallet/admin/metrics
// @access  Private/Admin
export const getAdminWalletMetrics = async (req, res) => {
  try {
    const [orders, adjustments] = await Promise.all([
      prisma.order.findMany({
      where: {
        status: { not: 'CANCELED' },
        cancelRequested: false
      },
      select: {
        id: true,
        totalPrice: true,
        mfgPayment: true,
        taxPrice: true,
        mfgPaymentStatus: true,
        priceAdjustmentStatus: true,
        priceAdjustmentAmount: true
      }
      }),
      prisma.manufacturerAdjustment.findMany({
        where: { status: 'APPROVED' },
        select: { amount: true, paymentStatus: true }
      })
    ]);

    const refundedOrders = await prisma.order.findMany({
      where: {
        status: 'CANCELED'
      },
      select: {
        id: true,
        refundStatus: true,
        refundAmount: true,
        totalPrice: true
      }
    });

    let grossRevenue = 0;
    let manufactureEarnings = 0;
    let paidToManufacture = 0;
    let pendingPayoutToManufacture = 0;
    let totalGstAmount = 0;
    let totalRefundedAmount = 0;
    let pendingRefundAmount = 0;

    orders.forEach(order => {
      const sale = Number(order.totalPrice) || 0;
      const mfgPay = Number(order.mfgPayment) || 0;
      const gst = Number(order.taxPrice) || 0;

      grossRevenue += sale;
      manufactureEarnings += mfgPay;
      totalGstAmount += gst;

      if (order.mfgPaymentStatus === 'Paid') {
        paidToManufacture += mfgPay;
      } else {
        pendingPayoutToManufacture += mfgPay;
      }
    });
    adjustments.forEach(adjustment => {
      const amount = Number(adjustment.amount) || 0;
      manufactureEarnings += amount;
      if (adjustment.paymentStatus === 'PAID') paidToManufacture += amount;
      else pendingPayoutToManufacture += amount;
    });

    refundedOrders.forEach(order => {
      const refAmt = (typeof order.refundAmount === 'number' && order.refundAmount > 0)
        ? order.refundAmount
        : (Number(order.totalPrice) || 0);
      const st = order.refundStatus || 'Refund Pending';
      if (st === 'Refunded') {
        totalRefundedAmount += refAmt;
      } else {
        pendingRefundAmount += refAmt;
      }
    });

    const ourEarnings = Number((grossRevenue - manufactureEarnings - totalRefundedAmount).toFixed(2));

    const metricsData = {
      grossRevenue: Number(grossRevenue.toFixed(2)),
      manufactureEarnings: Number(manufactureEarnings.toFixed(2)),
      paidToManufacture: Number(paidToManufacture.toFixed(2)),
      pendingPayoutToManufacture: Number(pendingPayoutToManufacture.toFixed(2)),
      totalRefundedAmount: Number(totalRefundedAmount.toFixed(2)),
      totalRefunded: Number(totalRefundedAmount.toFixed(2)),
      pendingRefundAmount: Number(pendingRefundAmount.toFixed(2)),
      ourEarnings,
      totalGstAmount: Number(totalGstAmount.toFixed(2)),
      totalGst: Number(totalGstAmount.toFixed(2))
    };

    res.json({
      success: true,
      message: 'Admin wallet metrics retrieved successfully',
      data: metricsData,
      ...metricsData
    });
  } catch (error) {
    console.error('Error computing admin wallet metrics:', error.message);
    res.status(500).json({ success: false, message: 'Failed to compute admin wallet metrics' });
  }
};

// @desc    Get Admin Wallet Transactions (Ledger)
// @route   GET /api/wallet/admin/transactions
// @access  Private/Admin
export const getAdminWalletTransactions = async (req, res) => {
  try {
    const [orders, adjustments] = await Promise.all([
      prisma.order.findMany({
      where: {
        status: { not: 'CANCELED' },
        cancelRequested: false
      },
      include: {
        user: { select: { fullName: true, email: true } },
        manufacturer: { select: { companyName: true, fullName: true } },
        items: {
          select: {
            id: true,
            name: true,
            size: true,
            color: true,
            quantity: true,
            price: true,
            product: {
              select: {
                id: true,
                price: true,
                manufacturePrice: true,
                colors: true,
                priceBreakdown: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
      }),
      prisma.manufacturerAdjustment.findMany({
        include: { manufacturer: { select: { companyName: true, fullName: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const cancelledOrders = await prisma.order.findMany({
      where: {
        status: 'CANCELED'
      },
      select: {
        id: true,
        totalPrice: true,
        mfgPayment: true,
        taxPrice: true,
        refundStatus: true,
        refundAmount: true,
        refundImage: true,
        refundNote: true,
        refundedAt: true,
        cancelledAt: true,
        cancelReason: true,
        createdAt: true,
        user: { select: { fullName: true, email: true } },
        manufacturer: { select: { companyName: true, fullName: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const regularTransactions = orders.map(order => {
      const grossSale = Number(order.totalPrice) || 0;
      const mfgPay = computeOrderMfgPayment(order);
      const gstVal = Number(order.taxPrice) || 0;
      const adjStatus = order.priceAdjustmentStatus || 'None';
      const isAdjusted = Boolean(adjStatus === 'Approved' && order.priceAdjustmentAmount && order.priceAdjustmentAmount > 0);

      return {
        id: `TXN-${order.id.slice(0, 8).toUpperCase()}`,
        orderId: order.id,
        createdAt: order.createdAt,
        customerName: order.user?.fullName || order.user?.email || 'Customer',
        manufacturerName: order.manufacturer?.companyName || order.manufacturer?.fullName || 'Unassigned',
        grossSaleValue: grossSale,
        manufacturerPayment: mfgPay,
        gstAmount: Number(gstVal.toFixed(2)),
        gstCollected: Number(gstVal.toFixed(2)),
        isAdjusted,
        isRefund: false,
        adjustmentStatus: adjStatus,
        priceAdjustmentStatus: adjStatus,
        adjustmentAmount: order.priceAdjustmentAmount || 0,
        adjustmentReason: order.priceAdjustmentReason || (isAdjusted ? 'Custom Specification Surcharge' : undefined),
        paymentStatus: order.mfgPaymentStatus === 'Paid' ? 'Paid' : 'Not Paid',
        paidDate: order.mfgPaidDate || null,
        ourEarnings: Number((grossSale - mfgPay).toFixed(2)),
        notes: order.mfgPaymentStatus === 'Paid' ? `Payout marked as Paid on ${order.mfgPaidDate || 'Recently'}` : undefined
      };
    });

    const refundTransactions = cancelledOrders.map(order => {
      const refAmt = (typeof order.refundAmount === 'number' && order.refundAmount > 0)
        ? order.refundAmount
        : (Number(order.totalPrice) || 0);
      const refStatus = order.refundStatus || 'Refund Pending';
      const isRefunded = refStatus === 'Refunded';

      return {
        id: `REF-${order.id.slice(0, 8).toUpperCase()}`,
        orderId: order.id,
        createdAt: order.refundedAt || order.cancelledAt || order.createdAt,
        customerName: order.user?.fullName || order.user?.email || 'Customer',
        manufacturerName: order.manufacturer?.companyName || order.manufacturer?.fullName || 'Unassigned',
        grossSaleValue: 0,
        manufacturerPayment: 0,
        gstAmount: 0,
        gstCollected: 0,
        isAdjusted: false,
        isRefund: true,
        refundStatus: refStatus,
        refundAmount: refAmt,
        refundImage: order.refundImage || null,
        refundNote: order.refundNote || null,
        adjustmentStatus: 'None',
        priceAdjustmentStatus: 'None',
        adjustmentAmount: 0,
        paymentStatus: isRefunded ? 'Paid' : (refStatus === 'Processing' ? 'Processing' : 'Pending'),
        paidDate: order.refundedAt ? new Date(order.refundedAt).toISOString().split('T')[0] : null,
        ourEarnings: isRefunded ? -refAmt : 0,
        notes: `Refund for Cancelled Order: ${order.cancelReason || 'Order Cancelled'}`
      };
    });

    const adjustmentTransactions = adjustments.map(adjustment => ({
      id: `ADJ-${adjustment.id.slice(0, 8).toUpperCase()}`,
      orderId: 'Other adjustment',
      createdAt: adjustment.createdAt,
      customerName: 'Manufacturer adjustment',
      manufacturerName: adjustment.manufacturer?.companyName || adjustment.manufacturer?.fullName || adjustment.manufacturer?.email || 'Manufacturer',
      grossSaleValue: 0,
      manufacturerPayment: adjustment.status === 'APPROVED' ? Number(adjustment.amount) : 0,
      gstAmount: 0,
      gstCollected: 0,
      isAdjusted: true,
      isOtherAdjustment: true,
      isRefund: false,
      adjustmentStatus: adjustment.status,
      priceAdjustmentStatus: adjustment.status,
      adjustmentAmount: Number(adjustment.amount),
      adjustmentReason: adjustment.reason,
      paymentStatus: adjustment.paymentStatus === 'PAID' ? 'Paid' : 'Not Paid',
      paidDate: adjustment.paidAt || null,
      ourEarnings: adjustment.status === 'APPROVED' ? -Number(adjustment.amount) : 0,
      notes: adjustment.status === 'PENDING' ? 'Awaiting administrator approval' : `Other adjustment: ${adjustment.reason}`
    }));

    // Merge and sort newest first
    const allTransactions = [...regularTransactions, ...refundTransactions, ...adjustmentTransactions].sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    res.json(allTransactions);
  } catch (error) {
    console.error('Error fetching admin wallet transactions:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch admin wallet transactions' });
  }
};

// @desc    Mark Transaction Payout as Paid
// @route   POST /api/wallet/admin/transactions/:id/pay
// @access  Private/Admin
export const markAdminTransactionPaid = async (req, res) => {
  try {
    const targetId = req.params?.id || req.body?.txnId || req.body?.id;
    if (!targetId) {
      return res.status(400).json({ success: false, message: 'Transaction ID is required' });
    }

    const order = await findOrderByIdOrTxn(targetId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Transaction / Order not found' });
    }

    // Financial Safety Guard: Cannot payout cancelled order
    if (order.status === 'CANCELED' || order.status === 'CANCELLED' || order.cancelRequested) {
      return res.status(400).json({
        success: false,
        message: `Cannot process payout for cancelled or pending-cancellation order ${order.id}.`
      });
    }

    // Financial Safety Guard: duplicate payout rejection
    if (order.mfgPaymentStatus === 'Paid') {
      return res.status(400).json({
        success: false,
        message: `Transaction ${order.id} is already marked as Paid. Duplicate payout rejected.`
      });
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Atomic conditional update in PostgreSQL to eliminate payout race conditions
    const updateResult = await prisma.order.updateMany({
      where: {
        id: order.id,
        mfgPaymentStatus: { not: 'Paid' },
        status: { not: 'CANCELED' },
        cancelRequested: false
      },
      data: {
        mfgPaymentStatus: 'Paid',
        mfgPaidDate: formattedDate
      }
    });

    if (updateResult.count === 0) {
      return res.status(400).json({
        success: false,
        message: `Transaction ${order.id} is already marked as Paid or was cancelled. Duplicate payout rejected.`
      });
    }

    // Return updated transactions list for UI, or structured response if requested
    if (req.query?.format === 'item' || req.body?.format === 'item') {
      return res.status(200).json({
        success: true,
        message: 'Payout marked as Paid successfully',
        data: { id: order.id, mfgPaymentStatus: 'Paid', mfgPaidDate: formattedDate }
      });
    }

    // Return the fresh transactions list
    return getAdminWalletTransactions(req, res);
  } catch (error) {
    console.error('Error marking transaction as paid:', error.message);
    res.status(500).json({ success: false, message: 'Failed to mark transaction as paid' });
  }
};

// @desc    Toggle Price Adjustment for Transaction
// @route   POST /api/wallet/admin/transactions/:id/toggle-adjustment
// @access  Private/Admin
export const toggleAdminTransactionAdjustment = async (req, res) => {
  try {
    const order = await findOrderByIdOrTxn(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Transaction / Order not found' });
    }

    await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: { product: true }
          }
        }
      });
      if (!current) {
        throw new Error('Order not found');
      }

      const currentlyAdjusted = Boolean(
        current.priceAdjustmentStatus === 'Approved' &&
        (current.priceAdjustmentAmount && current.priceAdjustmentAmount > 0)
      );

      // Compute base items manufacturing total
      let baseMfg = 0;
      if (Array.isArray(current.items) && current.items.length > 0) {
        for (const it of current.items) {
          const itColorAssets = resolveColorAssets(it.product || {}, it.color);
          const matched = itColorAssets.matchedColor;
          const colorMfgPrice = (matched && typeof matched.manufacturePrice === 'number' && matched.manufacturePrice > 0)
            ? matched.manufacturePrice
            : null;
          const colorBreakdownTotal = (matched && (typeof matched.baseCost === 'number' || typeof matched.printingCost === 'number'))
            ? ((Number(matched.baseCost) || 0) + (Number(matched.printingCost) || 0) + (Number(matched.shippingCost) || 0) + (Number(matched.additionalCost) || 0))
            : 0;
          const targetColorMfg = colorMfgPrice || (colorBreakdownTotal > 0 ? colorBreakdownTotal : null);
          const unitMfg = targetColorMfg
            || ((typeof it.product?.manufacturePrice === 'number' && it.product.manufacturePrice > 0)
              ? it.product.manufacturePrice
              : 0);
          baseMfg += unitMfg * (it.quantity || 1);
        }
      }

      if (baseMfg <= 0) {
        baseMfg = currentlyAdjusted
          ? Math.max(0, (current.mfgPayment || 0) - (Number(current.priceAdjustmentAmount) || 100))
          : (current.mfgPayment || 0);
      }

      const targetAdj = Number(current.priceAdjustmentAmount) > 0 ? Number(current.priceAdjustmentAmount) : 100.0;
      let newMfgPayment;
      let newAdjAmount;
      let newStatus;
      let newReason;

      if (currentlyAdjusted) {
        // Toggle off: return strictly to baseMfg without adjustment
        newMfgPayment = Number(baseMfg.toFixed(2));
        newAdjAmount = 0;
        newStatus = 'None';
        newReason = null;
      } else {
        // Toggle on: strictly baseMfg + single adjustment (+₹100 once per order, never multiplied by 2 items)
        newMfgPayment = Number((baseMfg + targetAdj).toFixed(2));
        newAdjAmount = targetAdj;
        newStatus = 'Approved';
        newReason = current.priceAdjustmentReason || 'Custom Specification Surcharge';
      }

      return await tx.order.update({
        where: { id: current.id },
        data: {
          mfgPayment: newMfgPayment,
          priceAdjustmentAmount: newAdjAmount,
          priceAdjustmentStatus: newStatus,
          priceAdjustmentReason: newReason
        }
      });
    });

    // Return the fresh transactions list
    return getAdminWalletTransactions(req, res);
  } catch (error) {
    console.error('Error toggling transaction adjustment:', error.message);
    res.status(500).json({ success: false, message: 'Failed to toggle transaction adjustment' });
  }
};
