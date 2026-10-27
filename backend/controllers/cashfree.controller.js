import * as cashfreeService from '../services/cashfree.service.js';
import { prisma } from '../lib/prisma.js';

// @desc    Create Cashfree Payment Session for checkout
// @route   POST /api/orders/cashfree/create-session
// @access  Private (Customer)
export const createPaymentSession = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden access to order' });
    }

    const customerUser = order.user || req.user;
    const sessionData = await cashfreeService.createCashfreeOrderSession(order, customerUser);

    return res.status(200).json({
      success: true,
      data: sessionData
    });
  } catch (error) {
    console.error('Error creating Cashfree payment session:', error);
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Payment session creation failed',
      details: error.details || undefined
    });
  }
};

// @desc    Verify Cashfree Payment Status server-side
// @route   POST /api/orders/cashfree/verify
// @access  Private (Customer / Admin)
export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    const verification = await cashfreeService.verifyCashfreeOrder(orderId);

    return res.status(200).json({
      success: true,
      ...verification
    });
  } catch (error) {
    console.error('Error verifying Cashfree payment:', error);
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Payment verification failed',
      details: error.details || undefined
    });
  }
};

// @desc    Handle Cashfree Webhook Notifications (Idempotent)
// @route   POST /api/orders/cashfree/webhook
// @access  Public (Webhook signature verified)
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const rawBody = JSON.stringify(req.body);

    const isValid = cashfreeService.verifyCashfreeWebhookSignature(rawBody, signature, timestamp);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const { data, type } = req.body || {};
    let orderId = data?.order?.order_id;
    if (orderId) {
      // Normalize attempt-based order IDs (e.g. HS-12345-ABCD-A123 -> HS-12345-ABCD)
      orderId = orderId.replace(/-A\d+$/, '');
    }

    if (type === 'PAYMENT_SUCCESS_WEBHOOK' && orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'SUCCESSFUL',
          transactionId: data?.payment?.cf_payment_id ? String(data.payment.cf_payment_id) : undefined
        }
      });
    }

    return res.status(200).json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing Cashfree webhook:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
