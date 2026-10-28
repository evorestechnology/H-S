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
export const createCashfreeOrderSession = async (order, customer, options = {}) => {
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

  let clientUrl = options.clientOrigin
    || (options.returnUrl ? (() => { try { return new URL(options.returnUrl).origin; } catch (e) { return ''; } })() : '')
    || process.env.FRONTEND_URL
    || (process.env.CLIENT_URL ? (process.env.CLIENT_URL.split(',').find(u => u.includes('5173') || u.includes('3000')) || process.env.CLIENT_URL.split(',')[0].trim()) : '')
    || process.env.RENDER_EXTERNAL_URL
    || 'https://hands-monolith.onrender.com';

  // Safeguard: automatically fix mistyped hs-monolith to hands-monolith
  clientUrl = clientUrl.replace(/https?:\/\/hs-monolith\.onrender\.com/g, 'https://hands-monolith.onrender.com');
  const cleanClientUrl = clientUrl.replace(/\/+$/, '');

  let finalReturnUrl = options.returnUrl || `${cleanClientUrl}/track/${order.id}?cashfree_order_id={order_id}`;
  finalReturnUrl = finalReturnUrl.replace(/https?:\/\/hs-monolith\.onrender\.com/g, 'https://hands-monolith.onrender.com');

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
      return_url: finalReturnUrl
    }
  };

  let response;
  let data = {};
  try {
    response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000)
    });
    data = await response.json().catch(() => ({}));
  } catch (netErr) {
    console.error('[Cashfree] Network error/timeout calling Cashfree:', netErr.message);
    if (mode === 'SANDBOX') {
      return {
        success: true,
        mode: 'SIMULATED',
        payment_session_id: `session_sim_${order.id}_${Date.now()}`,
        order_id: order.id,
        order_amount: order.totalPrice,
        order_currency: 'INR',
        message: 'Cashfree sandbox timed out; operating in simulated mode for testing.'
      };
    }
    const err = new Error('Cashfree payment gateway is temporarily unreachable. Please try again.');
    err.status = 503;
    throw err;
  }

  // If order already exists in Cashfree (HTTP 409 conflict on retry)
  if (response.status === 409 || data.code === 'order_already_exists') {
    console.log(`[Cashfree] Order ${order.id} already exists. Querying existing session...`);
    try {
      const getRes = await fetch(`${baseUrl}/orders/${order.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2023-08-01',
          'x-client-id': appId,
          'x-client-secret': secretKey
        },
        signal: AbortSignal.timeout(10000)
      });

      if (getRes.ok) {
        const existingData = await getRes.json().catch(() => ({}));
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
              return_url: finalReturnUrl
            }
          }),
          signal: AbortSignal.timeout(10000)
        });

        if (retryResponse.ok) {
          const retryData = await retryResponse.json().catch(() => ({}));
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
    } catch (retryErr) {
      console.warn('[Cashfree] Retry lookup error:', retryErr.message);
    }
  }

  if (!response.ok) {
    console.error('[Cashfree] API Error:', response.status, data);
    // If in sandbox mode and credentials failed or server error occurred, gracefully provide simulated test session
    if (mode === 'SANDBOX' && (response.status === 401 || response.status >= 500)) {
      console.warn('[Cashfree] Sandbox error encountered. Falling back to simulated session for development/testing.');
      return {
        success: true,
        mode: 'SIMULATED',
        payment_session_id: `session_sim_${order.id}_${Date.now()}`,
        order_id: order.id,
        order_amount: order.totalPrice,
        order_currency: 'INR',
        message: 'Cashfree sandbox unavailable; operating in simulated mode for testing.'
      };
    }
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

  // Query payments list for explicit payment status and decline/failure reasons
  let payments = [];
  try {
    const payRes = await fetch(`${baseUrl}/orders/${orderId}/payments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey
      }
    });
    if (payRes.ok) {
      payments = await payRes.json().catch(() => []);
    } else if (orderId !== cleanDbOrderId) {
      const payResClean = await fetch(`${baseUrl}/orders/${cleanDbOrderId}/payments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2023-08-01',
          'x-client-id': appId,
          'x-client-secret': secretKey
        }
      });
      if (payResClean.ok) {
        payments = await payResClean.json().catch(() => []);
      }
    }
  } catch (payErr) {
    console.warn('[Cashfree] Could not fetch payments list:', payErr.message);
  }

  const paymentsList = Array.isArray(payments) ? payments : [];
  const successPayment = paymentsList.find(p => p.payment_status === 'SUCCESS');
  const isPaid = data.order_status === 'PAID' || Boolean(successPayment);

  let newPaymentStatus = 'PENDING';
  let isFailed = false;
  let failReason = null;
  let finalTxId = data.cf_order_id ? String(data.cf_order_id) : undefined;

  if (isPaid) {
    newPaymentStatus = 'SUCCESSFUL';
    if (successPayment?.cf_payment_id) {
      finalTxId = String(successPayment.cf_payment_id);
    }
  } else {
    const failedPayment = paymentsList.find(p => ['FAILED', 'USER_DROPPED', 'CANCELLED', 'VOID'].includes(p.payment_status));
    isFailed = Boolean(failedPayment) || ['EXPIRED', 'TERMINATED', 'CANCELLED'].includes(data.order_status);

    if (isFailed) {
      newPaymentStatus = 'FAILED';
      failReason = failedPayment?.error_details?.error_description || failedPayment?.payment_message || (data.order_status === 'EXPIRED' ? 'Payment session expired' : 'Payment was declined or cancelled at checkout');
      if (failedPayment?.cf_payment_id) {
        finalTxId = String(failedPayment.cf_payment_id);
      }
    } else {
      newPaymentStatus = data.order_status === 'ACTIVE' ? 'PENDING' : 'NOT_SUCCESSFUL';
    }
  }

  const existingOrder = await prisma.order.findUnique({
    where: { id: cleanDbOrderId },
    select: { status: true, cancelReason: true }
  });

  const orderUpdatePayload = {
    paymentStatus: newPaymentStatus,
    transactionId: finalTxId
  };

  // If payment failed or order was cancelled, ensure order status is marked as CANCELED
  if (isFailed || newPaymentStatus === 'FAILED' || newPaymentStatus === 'NOT_SUCCESSFUL') {
    if (!existingOrder || existingOrder.status !== 'DELIVERED') {
      orderUpdatePayload.status = 'CANCELED';
      orderUpdatePayload.cancelReason = failReason || existingOrder?.cancelReason || 'Payment failed or cancelled at checkout';
      orderUpdatePayload.cancelledAt = new Date();
      orderUpdatePayload.cancelledByRole = 'CUSTOMER';
    }
  }

  const updatedOrder = await prisma.order.update({
    where: { id: cleanDbOrderId },
    data: orderUpdatePayload
  });

  return {
    success: true,
    mode,
    paymentStatus: newPaymentStatus,
    isFailed,
    cashfreeData: data,
    payments: paymentsList,
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
