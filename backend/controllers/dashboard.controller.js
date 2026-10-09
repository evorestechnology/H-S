import { prisma } from '../lib/prisma.js';
import { resolveColorAssets } from '../services/order.service.js';

// Helper to compute genuine percentage growth between two periods
const calcGrowth = (current, previous) => {
  const curr = Number(current) || 0;
  const prev = Number(previous) || 0;
  if (prev === 0) {
    return curr > 0 ? 100 : 0;
  }
  const growth = ((curr - prev) / prev) * 100;
  return Number(growth.toFixed(1));
};

// @desc    Get complete real-time dashboard analytics from database
// @route   GET /api/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const period = req.query.period || '7d';

    // Fetch independent dashboard datasets concurrently to eliminate roundtrip latency
    const [orders, users, totalUsersCount, drops, products] = await Promise.all([
      // 1. Fetch Orders with strictly needed fields (exclude heavy images, specs, priceBreakdowns)
      prisma.order.findMany({
        select: {
          id: true,
          totalPrice: true,
          createdAt: true,
          updatedAt: true,
          status: true,
          mfgPayment: true,
          paymentStatus: true,
          transactionId: true,
          shipperName: true,
          trackingNumber: true,
          trackingLink: true,
          priceAdjustmentStatus: true,
          priceAdjustmentAmount: true,
          priceAdjustmentReason: true,
          cancelRequested: true,
          cancelReason: true,
          user: { select: { id: true, fullName: true, email: true } },
          items: {
            select: {
              productId: true,
              name: true,
              color: true,
              price: true,
              quantity: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  manufacturePrice: true,
                  colors: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // 2. Fetch Users (minimal fields only)
      prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          createdAt: true,
          status: true
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),

      // 3. User Count
      prisma.user.count(),

      // 4. Fetch Drops (exclude full nested product specs and image trees)
      prisma.drop.findMany({
        select: {
          id: true,
          dropName: true,
          title: true,
          status: true,
          isActive: true,
          releaseDate: true,
          createdAt: true,
          products: {
            select: {
              id: true,
              coverPhoto: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // 5. Fetch Products (lean projection: stock, name, coverPhoto, category, updatedAt)
      prisma.product.findMany({
        select: {
          id: true,
          name: true,
          stock: true,
          coverPhoto: true,
          category: true,
          updatedAt: true
        },
        orderBy: { stock: 'asc' }
      })
    ]);

    // --- Define Real Time Boundaries ---
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yesterdayEnd = new Date(todayStart.getTime() - 1);

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Filter subsets for real month-over-month and day-over-day growth
    let totalRevenue = 0;
    let todaysRevenue = 0;
    let yesterdayRevenue = 0;
    let thisMonthRevenue = 0;
    let lastMonthRevenue = 0;

    let completedOrders = 0;
    let thisMonthCompleted = 0;
    let lastMonthCompleted = 0;

    let pendingOrders = 0;
    let thisMonthPending = 0;
    let lastMonthPending = 0;

    let productsSold = 0;
    let thisMonthSold = 0;
    let lastMonthSold = 0;

    let walletBalance = 0;
    let thisMonthWallet = 0;
    let lastMonthWallet = 0;

    let thisMonthOrdersCount = 0;
    let lastMonthOrdersCount = 0;

    orders.forEach(order => {
      const price = Number(order.totalPrice) || 0;
      const oDate = order.createdAt ? new Date(order.createdAt) : null;
      const isDelivered = order.status === 'DELIVERED';
      const isPending = order.status === 'IN_PROGRESS' || order.status === 'SHIPPING';
      const isCanceled = order.status === 'CANCELED' || order.status === 'CANCELLED' || Boolean(order.cancelRequested);

      // Manufacturing payment / Platform Margin
      let mfgPay = Number(order.mfgPayment) || 0;
      if (mfgPay === 0 && Array.isArray(order.items) && order.items.length > 0) {
        mfgPay = order.items.reduce((acc, it) => {
          const itColorAssets = resolveColorAssets(it.product || {}, it.color);
          const matched = itColorAssets.matchedColor;
          const colorMfgPrice = (matched && typeof matched.manufacturePrice === 'number' && matched.manufacturePrice > 0)
            ? matched.manufacturePrice
            : null;
          const colorBreakdownTotal = (matched && (typeof matched.baseCost === 'number' || typeof matched.printingCost === 'number'))
            ? ((Number(matched.baseCost) || 0) + (Number(matched.printingCost) || 0) + (Number(matched.shippingCost) || 0) + (Number(matched.additionalCost) || 0))
            : 0;
          const unitMfg = colorMfgPrice
            || (colorBreakdownTotal > 0 ? colorBreakdownTotal : null)
            || (typeof it.product?.manufacturePrice === 'number' && it.product.manufacturePrice > 0 ? it.product.manufacturePrice : 0);
          return acc + (unitMfg * (it.quantity || 1));
        }, 0);
      }
      const orderMargin = Math.max(0, price - mfgPay);

      // Quantities sold
      const itemCount = order.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 1;

      // Global non-canceled totals
      if (!isCanceled) {
        totalRevenue += price;
        walletBalance += orderMargin;
        productsSold += itemCount;
      }

      if (isDelivered) completedOrders++;
      if (isPending) pendingOrders++;

      // Date matching
      if (oDate) {
        // Today vs Yesterday
        if (oDate >= todayStart && !isCanceled) {
          todaysRevenue += price;
        } else if (oDate >= yesterdayStart && oDate <= yesterdayEnd && !isCanceled) {
          yesterdayRevenue += price;
        }

        // This Month vs Last Month
        if (oDate >= thisMonthStart) {
          thisMonthOrdersCount++;
          if (!isCanceled) {
            thisMonthRevenue += price;
            thisMonthWallet += orderMargin;
            thisMonthSold += itemCount;
          }
          if (isDelivered) thisMonthCompleted++;
          if (isPending) thisMonthPending++;
        } else if (oDate >= lastMonthStart && oDate <= lastMonthEnd) {
          lastMonthOrdersCount++;
          if (!isCanceled) {
            lastMonthRevenue += price;
            lastMonthWallet += orderMargin;
            lastMonthSold += itemCount;
          }
          if (isDelivered) lastMonthCompleted++;
          if (isPending) lastMonthPending++;
        }
      }
    });

    // Users growth calculation
    const thisMonthUsers = users.filter(u => u.createdAt && new Date(u.createdAt) >= thisMonthStart).length;
    const lastMonthUsers = users.filter(u => u.createdAt && new Date(u.createdAt) >= lastMonthStart && new Date(u.createdAt) <= lastMonthEnd).length;

    const activeDrops = drops.filter(d => d.status === 'Live' || d.isActive === true).length;

    const summary = {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalRevenueGrowth: calcGrowth(thisMonthRevenue, lastMonthRevenue),
      todaysRevenue: Number(todaysRevenue.toFixed(2)),
      todaysRevenueGrowth: calcGrowth(todaysRevenue, yesterdayRevenue),
      totalOrders: orders.length,
      totalOrdersGrowth: calcGrowth(thisMonthOrdersCount, lastMonthOrdersCount),
      pendingOrders,
      pendingOrdersGrowth: calcGrowth(thisMonthPending, lastMonthPending),
      completedOrders,
      completedOrdersGrowth: calcGrowth(thisMonthCompleted, lastMonthCompleted),
      totalUsers: totalUsersCount,
      totalUsersGrowth: calcGrowth(thisMonthUsers, lastMonthUsers),
      activeDrops,
      activeDropsGrowth: 0,
      productsSold,
      productsSoldGrowth: calcGrowth(thisMonthSold, lastMonthSold),
      walletBalance: Number(walletBalance.toFixed(2)),
      walletBalanceGrowth: calcGrowth(thisMonthWallet, lastMonthWallet)
    };

    // --- Dynamic Chart Analytics (Based on requested period: 7d, 30d, 90d, 1y) ---
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthsOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueAnalytics = [];
    const orderAnalytics = [];

    if (period === '30d') {
      // Past 30 Days daily breakdown
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const label = `${monthsOfYear[d.getMonth()]} ${d.getDate()}`;

        const dayOrders = orders.filter(o => o.createdAt && new Date(o.createdAt).toISOString().split('T')[0] === dateStr);
        const dayRevenue = dayOrders.filter(o => o.status !== 'CANCELED').reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

        revenueAnalytics.push({
          name: label,
          value: Number(dayRevenue.toFixed(2))
        });
        orderAnalytics.push({
          name: label,
          completed: dayOrders.filter(o => o.status === 'DELIVERED').length,
          pending: dayOrders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'SHIPPING').length,
          cancelled: dayOrders.filter(o => o.status === 'CANCELED').length
        });
      }
    } else if (period === '90d') {
      // Past 12 Weeks breakdown
      for (let i = 11; i >= 0; i--) {
        const endW = new Date();
        endW.setDate(endW.getDate() - (i * 7));
        const startW = new Date(endW);
        startW.setDate(startW.getDate() - 6);

        const label = `Wk ${12 - i}`;
        const weekOrders = orders.filter(o => {
          if (!o.createdAt) return false;
          const dt = new Date(o.createdAt);
          return dt >= startW && dt <= endW;
        });
        const weekRevenue = weekOrders.filter(o => o.status !== 'CANCELED').reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

        revenueAnalytics.push({
          name: label,
          value: Number(weekRevenue.toFixed(2))
        });
        orderAnalytics.push({
          name: label,
          completed: weekOrders.filter(o => o.status === 'DELIVERED').length,
          pending: weekOrders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'SHIPPING').length,
          cancelled: weekOrders.filter(o => o.status === 'CANCELED').length
        });
      }
    } else if (period === '1y') {
      // Past 12 Months breakdown
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
        const label = `${monthsOfYear[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;

        const monthOrders = orders.filter(o => {
          if (!o.createdAt) return false;
          const dt = new Date(o.createdAt);
          return dt >= mStart && dt <= mEnd;
        });
        const monthRevenue = monthOrders.filter(o => o.status !== 'CANCELED').reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

        revenueAnalytics.push({
          name: label,
          value: Number(monthRevenue.toFixed(2))
        });
        orderAnalytics.push({
          name: label,
          completed: monthOrders.filter(o => o.status === 'DELIVERED').length,
          pending: monthOrders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'SHIPPING').length,
          cancelled: monthOrders.filter(o => o.status === 'CANCELED').length
        });
      }
    } else {
      // Default: Past 7 Days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = daysOfWeek[d.getDay()];

        const dayOrders = orders.filter(o => {
          const oDate = o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : '';
          return oDate === dateStr;
        });

        const dayRevenue = dayOrders.filter(o => o.status !== 'CANCELED').reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
        const dayCompleted = dayOrders.filter(o => o.status === 'DELIVERED').length;
        const dayPending = dayOrders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'SHIPPING').length;
        const dayCancelled = dayOrders.filter(o => o.status === 'CANCELED').length;

        revenueAnalytics.push({
          name: dayName,
          value: Number(dayRevenue.toFixed(2))
        });

        orderAnalytics.push({
          name: dayName,
          completed: dayCompleted,
          pending: dayPending,
          cancelled: dayCancelled
        });
      }
    }

    // --- Recent Orders ---
    const recentOrders = orders.slice(0, 6).map(order => {
      const firstItem = order.items?.[0];
      let statusMap = 'Pending';
      if (order.status === 'DELIVERED') statusMap = 'Completed';
      else if (order.status === 'SHIPPING') statusMap = 'Shipping';
      else if (order.status === 'IN_PROGRESS' || order.status === 'PROCESSING') statusMap = 'In Progress';
      else if (order.status === 'CANCELED') statusMap = 'Cancelled';
      else if (order.cancelRequested) statusMap = 'Cancel Requested';

      const paymentDisplay = order.paymentStatus === 'SUCCESSFUL'
        ? (order.transactionId ? 'Online' : 'Online')
        : (order.paymentStatus || 'Pending');

      const productSummary = (Array.isArray(order.items) && order.items.length > 1)
        ? order.items.map(i => `${i.quantity > 1 ? `${i.quantity}x ` : ''}${i.name || i.product?.name || 'Apparel Item'}`).join(', ')
        : (firstItem?.name || firstItem?.product?.name || 'Apparel Item');

      return {
        id: order.id,
        customer: order.user?.fullName || (order.user?.email ? order.user.email.split('@')[0] : 'Customer'),
        product: productSummary,
        amount: Number(order.totalPrice) || 0,
        payment: paymentDisplay,
        status: statusMap,
        date: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
        shipperName: order.shipperName || null,
        trackingId: order.trackingNumber || null,
        trackingLink: order.trackingLink || null,
        priceAdjustmentStatus: order.priceAdjustmentStatus || 'None',
        priceAdjustmentAmount: Number(order.priceAdjustmentAmount) || 0,
        priceAdjustmentReason: order.priceAdjustmentReason || '',
        cancelRequested: order.cancelRequested || false,
        couponCode: order.couponCode || null,
        couponDiscount: Number(order.couponDiscount) || 0,
        couponApplied: order.couponApplied || Boolean(order.couponCode || (order.couponDiscount && order.couponDiscount > 0))
      };
    });

    // --- Latest Drops ---
    const latestDrops = drops.slice(0, 4).map(drop => ({
      id: drop.id,
      image: drop.products?.[0]?.coverPhoto || drop.products?.[0]?.images?.[0] || null,
      name: drop.dropName || drop.title || 'Collection Drop',
      productsCount: drop.products?.length || 0,
      status: drop.status || (drop.isActive ? 'Live' : 'Draft'),
      launchDate: drop.releaseDate ? new Date(drop.releaseDate).toISOString().split('T')[0] : (drop.createdAt ? new Date(drop.createdAt).toISOString().split('T')[0] : todayStr)
    }));

    // --- Top Products (Genuinely aggregated from actual database order line items) ---
    const productSalesMap = new Map();
    orders.forEach(order => {
      if (order.status !== 'CANCELED' && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const pId = item.productId || item.product?.id;
          if (!pId) return;
          const qty = item.quantity || 1;
          const unitPrice = Number(item.price) || Number(item.product?.price) || 0;
          const existing = productSalesMap.get(pId) || { unitsSold: 0, revenue: 0 };
          productSalesMap.set(pId, {
            unitsSold: existing.unitsSold + qty,
            revenue: existing.revenue + (unitPrice * qty)
          });
        });
      }
    });

    const topSellingProducts = products
      .map(prod => {
        const sales = productSalesMap.get(prod.id) || { unitsSold: 0, revenue: 0 };
        return {
          id: prod.id,
          image: prod.coverPhoto || prod.images?.[0] || null,
          name: prod.name,
          unitsSold: sales.unitsSold,
          revenue: Number(sales.revenue.toFixed(2)),
          category: prod.category || 'Apparel'
        };
      })
      .sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue)
      .slice(0, 5);

    // --- Low Stock Products (Real stock levels <= 15) ---
    const lowStockProducts = products
      .filter(p => p.stock <= 15)
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.name,
        remainingStock: p.stock,
        status: p.stock === 0 ? 'Out of Stock' : 'Low'
      }));

    // --- Recent Users ---
    const recentUsers = users.slice(0, 5).map(u => ({
      id: u.id,
      profileImage: null,
      username: u.fullName || (u.email ? u.email.split('@')[0] : 'User'),
      email: u.email,
      joinedDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : todayStr,
      status: u.status || 'Active'
    }));

    // --- Real Consolidated Activity Feed ---
    const activityFeed = [];

    // Recent orders
    orders.slice(0, 4).forEach(o => {
      activityFeed.push({
        id: `ACT-ORD-${o.id.slice(0, 6)}`,
        type: 'order_completed',
        message: `Order #${o.id.slice(0, 8)} for ₹${Number(o.totalPrice).toFixed(2)} (${o.user?.fullName || 'Customer'}).`,
        timestamp: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString()
      });
    });

    // Recent drops
    drops.slice(0, 3).forEach(d => {
      activityFeed.push({
        id: `ACT-DRP-${d.id.slice(0, 6)}`,
        type: 'drop_published',
        message: `Drop '${d.dropName || d.title || 'Collection'}' active with ${d.products?.length || 0} product(s).`,
        timestamp: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString()
      });
    });

    // Recent user signups
    users.slice(0, 3).forEach(u => {
      activityFeed.push({
        id: `ACT-USR-${u.id.slice(0, 6)}`,
        type: 'user_registered',
        message: `User ${u.fullName || u.email} joined H&S platform.`,
        timestamp: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString()
      });
    });

    // Sort feed chronologically
    activityFeed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const finalActivityFeed = activityFeed.slice(0, 8);

    // --- Real Live System Notifications ---
    const notifications = [];

    // 1. Critical inventory alerts (Out of stock first, then low stock)
    products.filter(p => p.stock === 0).slice(0, 2).forEach(p => {
      notifications.push({
        id: `NOT-OOS-${p.id.slice(0, 6)}`,
        type: 'low_inventory',
        message: `Stock Alert: '${p.name}' is out of stock.`,
        timestamp: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
        isRead: false
      });
    });

    products.filter(p => p.stock > 0 && p.stock <= 5).slice(0, 2).forEach(p => {
      notifications.push({
        id: `NOT-LOW-${p.id.slice(0, 6)}`,
        type: 'low_inventory',
        message: `Low Stock: '${p.name}' has only ${p.stock} units left.`,
        timestamp: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
        isRead: false
      });
    });

    // 2. Pending price adjustment requests
    orders.filter(o => o.priceAdjustmentStatus === 'Pending Approval').slice(0, 2).forEach(o => {
      notifications.push({
        id: `NOT-ADJ-${o.id.slice(0, 6)}`,
        type: 'withdrawal_request',
        message: `Price Adjustment: Order #${o.id.slice(0, 8)} has a pending request (+₹${o.priceAdjustmentAmount}).`,
        timestamp: o.updatedAt ? new Date(o.updatedAt).toISOString() : new Date().toISOString(),
        isRead: false
      });
    });

    // 3. Pending cancel requests
    orders.filter(o => o.cancelRequested).slice(0, 2).forEach(o => {
      notifications.push({
        id: `NOT-CNL-${o.id.slice(0, 6)}`,
        type: 'new_order',
        message: `Order #${o.id.slice(0, 8)} requested cancellation: ${o.cancelReason || 'Customer requested'}.`,
        timestamp: o.updatedAt ? new Date(o.updatedAt).toISOString() : new Date().toISOString(),
        isRead: false
      });
    });

    // 4. Today's recent orders
    orders.filter(o => o.createdAt && new Date(o.createdAt) >= todayStart).slice(0, 3).forEach(o => {
      notifications.push({
        id: `NOT-ORD-${o.id.slice(0, 6)}`,
        type: 'new_order',
        message: `New Order received: #${o.id.slice(0, 8)} for ₹${Number(o.totalPrice).toFixed(2)}.`,
        timestamp: new Date(o.createdAt).toISOString(),
        isRead: false
      });
    });

    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const finalNotifications = notifications.slice(0, 8);

    const dashboardData = {
      summary,
      revenueAnalytics,
      orderAnalytics,
      recentOrders,
      latestDrops,
      topSellingProducts,
      lowStockProducts,
      recentUsers,
      activityFeed: finalActivityFeed,
      notifications: finalNotifications
    };

    return res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: dashboardData,
      ...dashboardData
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error generating dashboard statistics',
      data: null,
      errors: [error.message]
    });
  }
};
