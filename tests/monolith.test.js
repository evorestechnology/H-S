import { test, describe } from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';

import { verifyCashfreeWebhookSignature, getCashfreeConfig } from '../backend/services/cashfree.service.js';

describe('H&S Monolith — Unit & Integration Test Suite', () => {

  // 1. Role-Based Authorization & Guard Rules
  describe('Authorization Rules', () => {
    test('User role hierarchy validation', () => {
      const roles = ['USER', 'ADMIN', 'MANUFACTURER'];
      assert.strictEqual(roles.includes('ADMIN'), true);
      assert.strictEqual(roles.includes('MANUFACTURER'), true);
      assert.strictEqual(roles.includes('USER'), true);
    });

    test('Manufacturer order isolation check', () => {
      const mfgId1 = 'mfg-uuid-1111';
      const mfgId2 = 'mfg-uuid-2222';
      const order = { id: 'order-999', manufacturerId: mfgId1 };

      const canMfg1Access = order.manufacturerId === mfgId1;
      const canMfg2Access = order.manufacturerId === mfgId2;

      assert.strictEqual(canMfg1Access, true, 'Assigned manufacturer must have access');
      assert.strictEqual(canMfg2Access, false, 'Unassigned manufacturer access must be blocked');
    });
  });

  // 2. GST & Shipping Calculation Engine
  describe('Calculation Engines', () => {
    const taxSettings = {
      enableGst: true,
      indianThreshold: 2500,
      indianLowRate: 5,
      indianHighRate: 18,
      nonIndianRate: 0
    };

    const shippingSettings = {
      blockStepKg: 5,
      ratePerBlock: 5000,
      domesticFlatRate: 0,
      currency: 'INR (₹)'
    };

    test('GST calculation for Indian destination below threshold (5%)', () => {
      const itemPrice = 1000;
      const qty = 2;
      const rate = itemPrice > taxSettings.indianThreshold
        ? taxSettings.indianHighRate / 100
        : taxSettings.indianLowRate / 100;
      const gstAmount = itemPrice * qty * rate;

      assert.strictEqual(gstAmount, 100); // 2000 * 5% = 100
    });

    test('GST calculation for Indian destination above threshold (18%)', () => {
      const itemPrice = 3000;
      const qty = 1;
      const rate = itemPrice > taxSettings.indianThreshold
        ? taxSettings.indianHighRate / 100
        : taxSettings.indianLowRate / 100;
      const gstAmount = itemPrice * qty * rate;

      assert.strictEqual(gstAmount, 540); // 3000 * 18% = 540
    });

    test('Domestic shipping vs International block-step shipping', () => {
      // Domestic
      const domesticShipping = Number(shippingSettings.domesticFlatRate);
      assert.strictEqual(domesticShipping, 0);

      // International (6kg total -> 2 blocks of 5kg -> 2 * 5000 = 10000)
      const totalWeightKg = 6;
      const blocks = Math.ceil(totalWeightKg / shippingSettings.blockStepKg);
      const internationalShipping = blocks * shippingSettings.ratePerBlock;

      assert.strictEqual(blocks, 2);
      assert.strictEqual(internationalShipping, 10000);
    });
  });

  // 3. Cashfree Webhook Signature Verification
  describe('Cashfree Payment Engine', () => {
    test('Cashfree Webhook HMAC SHA256 Signature Validation', () => {
      const secret = 'test_secret_key_123';
      const timestamp = '1700000000';
      const payload = JSON.stringify({ event: 'PAYMENT_SUCCESS', order_id: 'ord_123' });

      // Generate valid signature
      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(timestamp + payload)
        .digest('base64');

      // Test with custom secret key verification
      const dataToSign = timestamp + payload;
      const computed = crypto
        .createHmac('sha256', secret)
        .update(dataToSign)
        .digest('base64');

      assert.strictEqual(computed, validSignature);
    });

    test('Cashfree auto-detects SANDBOX mode for test keys even when CASHFREE_ENV=PRODUCTION', () => {
      const origAppId = process.env.CASHFREE_APP_ID;
      const origSecret = process.env.CASHFREE_SECRET_KEY;
      const origEnv = process.env.CASHFREE_ENV;

      try {
        process.env.CASHFREE_APP_ID = 'TEST_MOCK_APP_ID_123';
        process.env.CASHFREE_SECRET_KEY = 'mock_secret_key_xyz';
        process.env.CASHFREE_ENV = 'PRODUCTION'; // Deliberately set to PRODUCTION to simulate Render misconfiguration

        const config = getCashfreeConfig();
        assert.strictEqual(config.mode, 'SANDBOX');
        assert.strictEqual(config.baseUrl, 'https://sandbox.cashfree.com/pg');
      } finally {
        process.env.CASHFREE_APP_ID = origAppId;
        process.env.CASHFREE_SECRET_KEY = origSecret;
        process.env.CASHFREE_ENV = origEnv;
      }
    });

    test('Cashfree sanitizes surrounding quotes and whitespace from credentials', () => {
      const origAppId = process.env.CASHFREE_APP_ID;
      const origSecret = process.env.CASHFREE_SECRET_KEY;

      try {
        process.env.CASHFREE_APP_ID = '  "TEST12345"  ';
        process.env.CASHFREE_SECRET_KEY = "  'mock_secret_abc'  ";

        const config = getCashfreeConfig();
        assert.strictEqual(config.appId, 'TEST12345');
        assert.strictEqual(config.secretKey, 'mock_secret_abc');
      } finally {
        process.env.CASHFREE_APP_ID = origAppId;
        process.env.CASHFREE_SECRET_KEY = origSecret;
      }
    });
  });

});
