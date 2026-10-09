import { prisma } from '../lib/prisma.js';
import { initCustomTables } from '../services/dbInit.service.js';

const defaultTaxSettings = {
  enableGst: true,
  nonIndianRate: 0,
  indianThreshold: 2500,
  indianLowRate: 5,
  indianHighRate: 18,
  gstinNumber: '29ABCDE1234F1Z5',
  registeredLegalName: 'H&S Apparel & Fitness Brands Private Limited',
  stateOfRegistration: 'Karnataka'
};

const defaultStoreSettings = {
  storeName: 'H&S Collective Store',
  storeEmail: 'contact@hscollective.com',
  currency: 'INR (₹)',
  timezone: 'Asia/Kolkata (IST)',
  address: 'Plot 42, Industrial Area Phase II, Bengaluru, Karnataka 560100',
  phone: '+91 98765 43210'
};

const defaultShippingSettings = {
  blockStepKg: 5,
  ratePerBlock: 5000,
  domesticFlatRate: 0,
  currency: 'INR (₹)'
};

export const getTaxSettingsHelper = async (client = prisma) => {
  try {
    const taxRow = await client.setting.findUnique({ where: { key: 'tax' } });
    if (taxRow && taxRow.value) {
      const parsed = typeof taxRow.value === 'string' ? JSON.parse(taxRow.value) : taxRow.value;
      return { ...defaultTaxSettings, ...parsed };
    }
  } catch (err) {
    console.error('Error fetching tax settings helper:', err);
  }
  return defaultTaxSettings;
};

export const getShippingSettingsHelper = async (client = prisma) => {
  try {
    const shipRow = await client.setting.findUnique({ where: { key: 'shipping' } });
    if (shipRow && shipRow.value) {
      const parsed = typeof shipRow.value === 'string' ? JSON.parse(shipRow.value) : shipRow.value;
      return { ...defaultShippingSettings, ...parsed };
    }
  } catch (err) {
    console.error('Error fetching shipping settings helper:', err);
  }
  return defaultShippingSettings;
};

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private/Admin
export const getSettings = async (req, res) => {
  try {
    await initCustomTables();

    const taxRow = await prisma.$queryRawUnsafe(`SELECT "value" FROM "Setting" WHERE "key" = 'tax'`);
    const storeRow = await prisma.$queryRawUnsafe(`SELECT "value" FROM "Setting" WHERE "key" = 'store'`);
    const shipRow = await prisma.$queryRawUnsafe(`SELECT "value" FROM "Setting" WHERE "key" = 'shipping'`);

    const taxSettings = taxRow.length > 0 && taxRow[0].value
      ? (typeof taxRow[0].value === 'string' ? JSON.parse(taxRow[0].value) : taxRow[0].value)
      : defaultTaxSettings;

    const storeSettings = storeRow.length > 0 && storeRow[0].value
      ? (typeof storeRow[0].value === 'string' ? JSON.parse(storeRow[0].value) : storeRow[0].value)
      : defaultStoreSettings;

    const shippingSettings = shipRow.length > 0 && shipRow[0].value
      ? (typeof shipRow[0].value === 'string' ? JSON.parse(shipRow[0].value) : shipRow[0].value)
      : defaultShippingSettings;

    res.json({
      taxSettings: { ...defaultTaxSettings, ...taxSettings },
      storeSettings: { ...defaultStoreSettings, ...storeSettings },
      shippingSettings: { ...defaultShippingSettings, ...shippingSettings }
    });
  } catch (error) {
    console.error('Error getting settings:', error.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve settings from database' });
  }
};

// @desc    Get public settings (Tax & Shipping rules for frontend checkout)
// @route   GET /api/settings/public
// @access  Public
export const getPublicSettings = async (req, res) => {
  try {
    const taxSettings = await getTaxSettingsHelper();
    const shippingSettings = await getShippingSettingsHelper();
    res.json({
      success: true,
      data: {
        taxSettings,
        shippingSettings
      }
    });
  } catch (error) {
    console.error('Error getting public settings:', error.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve public settings' });
  }
};

// @desc    Get shipping settings
// @route   GET /api/settings/shipping
// @access  Public
export const getShippingSettings = async (req, res) => {
  try {
    const shippingSettings = await getShippingSettingsHelper();
    res.json({
      success: true,
      data: shippingSettings,
      ...shippingSettings
    });
  } catch (error) {
    console.error('Error getting shipping settings:', error.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve shipping settings' });
  }
};

// @desc    Update Shipping settings
// @route   PUT /api/settings/shipping
// @access  Private/Admin
export const updateShippingSettings = async (req, res) => {
  try {
    await initCustomTables();
    const current = await getShippingSettingsHelper();
    const updated = { ...current, ...req.body };

    await prisma.$executeRawUnsafe(
      `INSERT INTO "Setting" ("key", "value", "updatedAt") 
       VALUES ('shipping', $1::jsonb, CURRENT_TIMESTAMP)
       ON CONFLICT ("key") DO UPDATE SET "value" = $1::jsonb, "updatedAt" = CURRENT_TIMESTAMP`,
      JSON.stringify(updated)
    );

    res.json({
      success: true,
      message: 'Shipping settings updated successfully',
      data: updated,
      ...updated
    });
  } catch (error) {
    console.error('Error updating shipping settings:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update shipping settings' });
  }
};

// @desc    Update Tax / GST settings
// @route   PUT /api/settings/tax
// @access  Private/Admin
export const updateTaxSettings = async (req, res) => {
  try {
    await initCustomTables();
    const updated = { ...defaultTaxSettings, ...req.body };

    await prisma.$executeRawUnsafe(
      `INSERT INTO "Setting" ("key", "value", "updatedAt") 
       VALUES ('tax', $1::jsonb, CURRENT_TIMESTAMP)
       ON CONFLICT ("key") DO UPDATE SET "value" = $1::jsonb, "updatedAt" = CURRENT_TIMESTAMP`,
      JSON.stringify(updated)
    );

    res.json(updated);
  } catch (error) {
    console.error('Error updating tax settings:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update tax settings' });
  }
};

// @desc    Update Store Profile settings
// @route   PUT /api/settings/store
// @access  Private/Admin
export const updateStoreSettings = async (req, res) => {
  try {
    await initCustomTables();
    const updated = { ...defaultStoreSettings, ...req.body };

    await prisma.$executeRawUnsafe(
      `INSERT INTO "Setting" ("key", "value", "updatedAt") 
       VALUES ('store', $1::jsonb, CURRENT_TIMESTAMP)
       ON CONFLICT ("key") DO UPDATE SET "value" = $1::jsonb, "updatedAt" = CURRENT_TIMESTAMP`,
      JSON.stringify(updated)
    );

    res.json(updated);
  } catch (error) {
    console.error('Error updating store settings:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update store settings' });
  }
};
