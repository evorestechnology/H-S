import fs from 'fs/promises';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { prisma } from '../lib/prisma.js';

const gunzipAsync = promisify(zlib.gunzip);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUPS_DIR = path.resolve(__dirname, '../../backups/db');

async function restore() {
  const targetArg = process.argv[2];
  let targetFile = targetArg;

  if (!targetFile) {
    // Find latest backup file
    const files = await fs.readdir(BACKUPS_DIR);
    const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.json.gz')).sort();
    if (backupFiles.length === 0) {
      console.error('No backup files found in', BACKUPS_DIR);
      process.exit(1);
    }
    targetFile = path.join(BACKUPS_DIR, backupFiles[backupFiles.length - 1]);
    console.log(`No backup specified. Defaulting to latest backup: ${targetFile}`);
  } else if (!path.isAbsolute(targetFile)) {
    targetFile = path.resolve(process.cwd(), targetFile);
  }

  console.log(`Starting restore from: ${targetFile}`);
  const compressedData = await fs.readFile(targetFile);
  const decompressed = await gunzipAsync(compressedData);
  const backup = JSON.parse(decompressed.toString('utf-8'));

  const { metadata, data } = backup;
  console.log('Backup metadata:', metadata);

  // Restore within transaction
  console.log('Restoring tables...');
  await prisma.$transaction(async (tx) => {
    // Clear existing data safely in reverse dependency order
    await tx.orderItem.deleteMany({});
    await tx.order.deleteMany({});
    await tx.cartItem.deleteMany({});
    await tx.cart.deleteMany({});
    await tx.review.deleteMany({});
    await tx.manufacturerAdjustment.deleteMany({});
    await tx.product.deleteMany({});
    await tx.drop.deleteMany({});
    await tx.coupon.deleteMany({});
    await tx.address.deleteMany({});

    // Restore Categories
    if (data.categories?.length) {
      for (const item of data.categories) {
        await tx.category.upsert({
          where: { id: item.id },
          create: item,
          update: item
        });
      }
    }

    // Restore Settings
    if (data.settings?.length) {
      for (const item of data.settings) {
        await tx.setting.upsert({
          where: { key: item.key },
          create: item,
          update: item
        });
      }
    }

    // Restore Users
    if (data.users?.length) {
      for (const item of data.users) {
        await tx.user.upsert({
          where: { id: item.id },
          create: item,
          update: item
        });
      }
    }

    // Restore Addresses
    if (data.addresses?.length) {
      for (const item of data.addresses) {
        await tx.address.create({ data: item });
      }
    }

    // Restore Drops
    if (data.drops?.length) {
      for (const item of data.drops) {
        await tx.drop.create({ data: item });
      }
    }

    // Restore Products
    if (data.products?.length) {
      for (const item of data.products) {
        await tx.product.create({ data: item });
      }
    }

    // Restore Coupons
    if (data.coupons?.length) {
      for (const item of data.coupons) {
        await tx.coupon.create({ data: item });
      }
    }

    // Restore Orders
    if (data.orders?.length) {
      for (const item of data.orders) {
        await tx.order.create({ data: item });
      }
    }

    // Restore Order Items
    if (data.orderItems?.length) {
      for (const item of data.orderItems) {
        await tx.orderItem.create({ data: item });
      }
    }
  });

  console.log('✓ Database restoration completed successfully!');
  process.exit(0);
}

restore().catch(err => {
  console.error('✗ Restoration failed:', err);
  process.exit(1);
});
