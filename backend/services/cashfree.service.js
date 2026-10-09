import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID || '';
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_CLIENT_SECRET || '';
const CASHFREE_ENV = (process.env.CASHFREE_ENV || 'SANDBOX').toUpperCase();

const BASE_URL = CASHFREE_ENV === 'PRODUCTION'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

/**
 * Creates a Cashfree payment session for an existing pending order.
 */
export const createCashfreeOrderSession = async (order, customer) => {
  if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
    // Return mock payment session for testing when credentials are not yet configured in env
    return {
      success: true,
      mode: 'SIMULATED',
      payment_session_id: `session_sim_${order.id}_${Date.now()}`,
      order_id: order.id,
      order_amount: order.totalPrice,
      order_currency: 'INR',
      message: 'Cashfree credentials not set in env; operating in simulated sandbox mode.'
    };
  }

  const clientUrl = process.env.FRONTEND_URL || (process.env.CLIENT_URL ? (process.env.CLIENT_URL.split(',').find(u => u.includes('5173') || u.includes('3000')) || process.env.CLIENT_URL.split(',')[0].trim()) : 'http://localhost:5173');
  const cleanPhone = (customer.mobile || '9999999999').replace(/[^0-9]/g, '').slice(-10) || '9999999999';

  const payload = {
    order_id: order.id,
    order_amount: Number(order.totalPrice.toFixed(2)),
    order_currency: 'INR',
    customer_details: {
      customer_id: customer.id || 'cust_guest',
      customer_email: customer.email || 'customer@hiandshi.shop',
      customer_phone: cleanPhone,
      customer_name: customer.fullName || 'Valued Customer'
    },
    order_meta: {
      return_url: `${clientUrl}/orders/${order.id}?cashfree_order_id={order_id}`
    }
  };

  const response = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': '2023-08-01',
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create Cashfree order session');
  }

  return {
    success: true,
    mode: CASHFREE_ENV,
    payment_session_id: data.payment_session_id,
    order_id: data.order_id,
    order_amount: data.order_amount,
    order_currency: data.order_currency
  };
};

/**
 * Server-side verification of payment status with Cashfree REST API.
 */
export const verifyCashfreeOrder = async (orderId) => {
  if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
    // If running without live Cashfree keys, update order status as SUCCESSFUL for testing
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'SUCCESSFUL',
        transactionId: `cf_sim_${Date.now()}`
      }
    });
    return {
      success: true,
      mode: 'SIMULATED',
      paymentStatus: 'SUCCESSFUL',
      order: updated
    };
  }

  const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': '2023-08-01',
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch Cashfree order status');
  }

  const isPaid = data.order_status === 'PAID';
  const newPaymentStatus = isPaid ? 'SUCCESSFUL' : (data.order_status === 'ACTIVE' ? 'PENDING' : 'NOT_SUCCESSFUL');

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: newPaymentStatus,
      transactionId: data.cf_order_id ? String(data.cf_order_id) : undefined
    }
  });

  return {
    success: true,
    mode: CASHFREE_ENV,
    paymentStatus: newPaymentStatus,
    cashfreeData: data,
    order: updatedOrder
  };
};

/**
 * Validates Cashfree webhook HMAC SHA256 signature.
 */
export const verifyCashfreeWebhookSignature = (rawBody, signature, timestamp) => {
  if (!CASHFREE_SECRET_KEY) return true; // Default true in sandbox/simulated mode
  if (!signature || !timestamp) return false;

  const dataToSign = timestamp + rawBody;
  const expectedSignature = crypto
    .createHmac('sha256', CASHFREE_SECRET_KEY)
    .update(dataToSign)
    .digest('base64');

  return signature === expectedSignature;
};
