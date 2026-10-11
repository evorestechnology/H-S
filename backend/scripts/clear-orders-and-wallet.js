import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { prisma } from '../lib/prisma.js';

// Ensure .env is loaded from root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const askConfirmation = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
};

async function clearOrdersAndWallet() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isForce = args.includes('--force') || args.includes('-y');

  console.log('\n===========================================================');
  console.log('   H&S DATABASE CLEANUP: ORDERS & WALLET DATA PURGE');
  console.log('===========================================================\n');

  try {
    // 1. Fetch current counts
    const [userCount, adminCount, mfgCount, productCount, orderCount, orderItemCount] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'MANUFACTURER' } }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.orderItem.count()
    ]);

    console.log('Current Database Summary:');
    console.log('-----------------------------------------------------------');
    console.log(`  • Customers (USER):       ${userCount}`);
    console.log(`  • Administrators:         ${adminCount}`);
    console.log(`  • Manufacturers:          ${mfgCount}`);
    console.log(`  • Products in Catalog:    ${productCount}`);
    console.log(`  • Orders:                 ${orderCount}`);
    console.log(`  • Order Items:            ${orderItemCount}`);
    console.log('-----------------------------------------------------------\n');

    if (orderCount === 0 && orderItemCount === 0) {
      console.log('ℹ️  No orders or wallet transactions found in the database. Nothing to clean.');
      return;
    }

    console.log('Target for Deletion:');
    console.log(`  ❌ All Order Items (${orderItemCount} records)`);
    console.log(`  ❌ All Orders (${orderCount} records)`);
    console.log('  ❌ All Wallet Metrics & Ledger Transactions (automatically reset to 0)');
    console.log('\nPreserved (Will NOT be touched):');
    console.log(`  ✅ All Users (${userCount + adminCount + mfgCount} accounts: admin, mfg, customers)`);
    console.log(`  ✅ All Products (${productCount} products)`);
    console.log('  ✅ Drops, Categories, Coupons, and System Settings\n');

    if (isDryRun) {
      console.log('🔍 [DRY RUN MODE]: No changes were made to the database.');
      console.log('To perform the actual deletion, run:');
      console.log('  node backend/scripts/clear-orders-and-wallet.js --force\n');
      return;
    }

    if (!isForce) {
      const confirm = await askConfirmation(
        '⚠️  WARNING: This will permanently delete all orders and wallet data.\nType "YES" to confirm and proceed: '
      );
      if (confirm !== 'yes') {
        console.log('\n❌ Operation cancelled by user. No data was deleted.\n');
        return;
      }
    }

    console.log('\nPurging orders and wallet data...');

    // 2. Perform atomic deletion in transaction
    const [deletedItems, deletedOrders] = await prisma.$transaction([
      prisma.orderItem.deleteMany({}),
      prisma.order.deleteMany({})
    ]);

    console.log('\n===========================================================');
    console.log('   ✅ PURGE COMPLETED SUCCESSFULLY');
    console.log('===========================================================');
    console.log(`Deleted Order Items:      ${deletedItems.count}`);
    console.log(`Deleted Orders:           ${deletedOrders.count}`);
    console.log('Wallet Balances & Ledger: Reset to ₹0.00 / Empty');
    console.log('-----------------------------------------------------------');
    console.log(`Surviving User Accounts:  ${userCount + adminCount + mfgCount} (Untouched)`);
    console.log('Catalog & Products:       Untouched\n');

  } catch (error) {
    console.error('\n❌ Error during cleanup:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

clearOrdersAndWallet();
