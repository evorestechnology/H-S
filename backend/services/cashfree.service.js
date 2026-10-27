import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';

/**
 * Dynamically resolves Cashfree configuration, credentials, and endpoints.
 * Automatically detects whether provided credentials are Sandbox or Production,
 * preventing 401 Authentication Failure when test keys are loaded into production environments.
 */
export const getCashfreeConfig = () => {
  const appId = (process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID || '')
    .trim()
    .replace(/^["']|["']$/g, '');
  const secretKey = (process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_CLIENT_SECRET || '')
    .trim()
    .replace(/^["']|["']$/g, '');
  const envVar = (process.env.CASHFREE_ENV || '').trim().toUpperCase();

  // Test credentials in Cashfree always start with 'TEST' (App ID) or 'cfsk_ma_test_' (Secret Key)
  const isTestKey = appId.startsWith('TEST') || secretKey.startsWith('cfsk_ma_test_');

  // Only use PRODUCTION if explicitly configured and credentials are NOT test keys
  const isProduction = !isTestKey && (envVar === 'PRODUCTION' || appId.startsWith('PROD') || secretKey.startsWith('cfsk_ma_prod_'));

  const mode = isProduction ? 'PRODUCTION' : 'SANDBOX';
  const baseUrl = isProduction
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

  return { appId, secretKey, mode, baseUrl };
};

/**
 * Creates a Cashfree payment session for an existing pending order.
 * Handles duplicate orders (HTTP 409), customer data sanitization, and auto-detects sandbox/production.
 */
export const createCashfreeOrderSession = async (order, customer) => {
  const { appId, secretKey, mode, baseUrl } = getCashfreeConfig();

  if (!appId || !secretKey) {
    // Return mock payment session for testing when credentials are not yet configured in env
    return {
      success: true,
      mode: 'SIMULATED',
      payment_session_id: `session_sim_${order.id}_${Date.now()}`,
      order_id: order.id,
      order_amount: order.totalPrice,
      order_currency: 'INR',
      message: 'Cashfree credentials not configured; operating in simulated sandbox mode.'
    };
  }

  const clientUrl = process.env.FRONTEND_URL
    || (process.env.CLIENT_URL ? (process.env.CLIENT_URL.split(',').find(u => u.includes('5173') || u.includes('3000')) || process.env.CLIENT_URL.split(',')[0].trim()) : '')
    || process.env.RENDER_EXTERNAL_URL
    || 'https://www.hiandshi.shop';
  const cleanClientUrl = clientUrl.replace(/\/+$/, '');

  // Extract customer phone number robustly from shippingAddress or customer user profile
  let rawPhone = '';
  if (order.shippingAddress) {
    try {
      const parsedAddr = typeof order.shippingAddress === 'string'
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress;
      rawPhone = parsedAddr.phone || parsedAddr.mobile || '';
    } catch (e) {
      // not a JSON string, fallback
    }
  }
  if (!rawPhone && customer) {
    rawPhone = customer.mobile || customer.phone || '';
  }
  const digitsOnly = String(rawPhone || '').replace(/[^0-9]/g, '');
  const cleanPhone = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : '9999999999';

  const cleanEmail = (customer?.email || 'customer@hiandshi.shop').trim();
  const cleanCustomerId = (customer?.id || 'cust_guest').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
  const cleanCustomerName = (customer?.fullName || 'Valued Customer').trim().slice(0, 80) || 'Valued Customer';

  const orderAmount = Number((Number(order.totalPrice) || 0).toFixed(2));
  if (orderAmount <= 0) {
    const zeroErr = new Error('Order amount must be greater than zero for Cashfree payment processing');
    zeroErr.status = 400;
    throw zeroErr;
  }

  const payload = {
    order_id: order.id,
    order_amount: orderAmount,
    order_currency: 'INR',
    customer_details: {
      customer_id: cleanCustomerId,
      customer_email: cleanEmail,
      customer_phone: cleanPhone,
      customer_name: cleanCustomerName
    },
    order_meta: {
      return_url: `${cleanClientUrl}/track/${order.id}?cashfree_order_id={order_id}`
    }
  };

  const response = await fetch(`${baseUrl}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': '2023-08-01',
      'x-client-id': appId,
      'x-client-secret': secretKey
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  // If order already exists in Cashfree (HTTP 409 conflict on retry)
  if (response.status === 409 || data.code === 'order_already_exists') {
    console.log(`[Cashfree] Order ${order.id} already exists. Querying existing session...`);
    const getRes = await fetch(`${baseUrl}/orders/${order.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey
      }
    });

    if (getRes.ok) {
      const existingData = await getRes.json();
      if (existingData.order_status === 'ACTIVE' && existingData.payment_session_id) {
        return {
          success: true,
          mode,
          payment_session_id: existingData.payment_session_id,
          order_id: existingData.order_id,
          order_amount: existingData.order_amount,
          order_currency: existingData.order_currency
        };
      }
      if (existingData.order_status === 'PAID') {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'SUCCESSFUL',
            transactionId: existingData.cf_order_id ? String(existingData.cf_order_id) : undefined
          }
        });
        return {
          success: true,
          mode,
          isAlreadyPaid: true,
          order_id: existingData.order_id,
          message: 'Order has already been paid successfully.'
        };
      }

      // If existing order session is expired or inactive, retry with attempt suffix
      const attemptOrderId = `${order.id}-A${Date.now().toString().slice(-4)}`;
      const retryResponse = await fetch(`${baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2023-08-01',
          'x-client-id': appId,
          'x-client-secret': secretKey
        },
        body: JSON.stringify({
          ...payload,
          order_id: attemptOrderId,
          order_meta: {
            return_url: `${cleanClientUrl}/track/${order.id}?cashfree_order_id={order_id}`
          }
        })
      });

      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        return {
          success: true,
          mode,
          payment_session_id: retryData.payment_session_id,
          order_id: retryData.order_id,
          order_amount: retryData.order_amount,
          order_currency: retryData.order_currency
        };
      }
    }
  }

  if (!response.ok) {
    const errorMsg = data.message || (data.code ? `Cashfree Error: ${data.code}` : 'Failed to create Cashfree order session');
    const err = new Error(errorMsg);
    err.status = response.status;
    err.details = data.code || data.type || undefined;
    throw err;
  }

  return {
    success: true,
    mode,
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
  const { appId, secretKey, mode, baseUrl } = getCashfreeConfig();
  const cleanDbOrderId = orderId.replace(/-A\d+$/, '');

  if (!appId || !secretKey) {
    // If running without live Cashfree keys, update order status as SUCCESSFUL for testing
    const updated = await prisma.order.update({
      where: { id: cleanDbOrderId },
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

  // Attempt fetch using the supplied orderId or clean database ID
  let response = await fetch(`${baseUrl}/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': '2023-08-01',
      'x-client-id': appId,
      'x-client-secret': secretKey
    }
  });

  if (!response.ok && orderId !== cleanDbOrderId) {
    response = await fetch(`${baseUrl}/orders/${cleanDbOrderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey
      }
    });
  }

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.message || 'Failed to fetch Cashfree order status');
    err.status = response.status;
    err.details = data.code || undefined;
    throw err;
  }

  const isPaid = data.order_status === 'PAID';
  const newPaymentStatus = isPaid ? 'SUCCESSFUL' : (data.order_status === 'ACTIVE' ? 'PENDING' : 'NOT_SUCCESSFUL');

  const updatedOrder = await prisma.order.update({
    where: { id: cleanDbOrderId },
    data: {
      paymentStatus: newPaymentStatus,
      transactionId: data.cf_order_id ? String(data.cf_order_id) : undefined
    }
  });

  return {
    success: true,
    mode,
    paymentStatus: newPaymentStatus,
    cashfreeData: data,
    order: updatedOrder
  };
};

/**
 * Validates Cashfree webhook HMAC SHA256 signature.
 */
export const verifyCashfreeWebhookSignature = (rawBody, signature, timestamp) => {
  const { secretKey } = getCashfreeConfig();
  if (!secretKey) return true; // Default true in sandbox/simulated mode
  if (!signature || !timestamp) return false;

  const dataToSign = timestamp + rawBody;
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(dataToSign)
    .digest('base64');

  return signature === expectedSignature;
};
