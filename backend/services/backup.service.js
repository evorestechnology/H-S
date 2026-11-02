import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { prisma } from '../lib/prisma.js';
import { supabase } from '../lib/supabase.js';

const gzipAsync = promisify(zlib.gzip);
const gunzipAsync = promisify(zlib.gunzip);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUPS_DIR = path.resolve(__dirname, '../../backups/db');
const BACKUP_BUCKET = 'db-backups';
const HOURLY_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

// Ensure backup directory exists
const ensureBackupDir = async () => {
  try {
    await fs.mkdir(BACKUPS_DIR, { recursive: true });
  } catch (err) {
    console.error('[BackupService] Failed to create backup directory:', err.message);
  }
};

// Protection against overlapping backup executions
let activeBackupPromise = null;

export const isBackupInProgress = () => activeBackupPromise !== null;

/**
 * Perform a full snapshot backup of all PostgreSQL database tables.
 */
export const performBackup = async (triggerType = 'SCHEDULED_HOURLY') => {
  // Guard against concurrent backup runs: reuse ongoing backup execution
  if (activeBackupPromise) {
    console.log(`[BackupService] Backup already in progress. Re-using active run for trigger (${triggerType}).`);
    return activeBackupPromise;
  }

  activeBackupPromise = (async () => {
    const startTime = Date.now();
    console.log(`[BackupService] Starting database backup (${triggerType})...`);
    await ensureBackupDir();

    try {
      // Query tables sequentially with controlled concurrency (1 connection at a time)
      // to completely eliminate connection pool exhaustion under the 15-connection ceiling.
      const tableDefinitions = [
        { key: 'users', query: () => prisma.user.findMany() },
        { key: 'addresses', query: () => prisma.address.findMany() },
        { key: 'categories', query: () => prisma.category.findMany() },
        { key: 'drops', query: () => prisma.drop.findMany() },
        { key: 'products', query: () => prisma.product.findMany() },
        { key: 'reviews', query: () => prisma.review.findMany() },
        { key: 'carts', query: () => prisma.cart.findMany() },
        { key: 'cartItems', query: () => prisma.cartItem.findMany() },
        { key: 'orders', query: () => prisma.order.findMany() },
        { key: 'orderItems', query: () => prisma.orderItem.findMany() },
        { key: 'manufacturerAdjustments', query: () => prisma.manufacturerAdjustment.findMany() },
        { key: 'coupons', query: () => prisma.coupon.findMany() },
        { key: 'settings', query: () => prisma.setting.findMany() }
      ];

      const data = {};
      const counts = {};

      for (const { key, query } of tableDefinitions) {
        try {
          const records = await query();
          data[key] = records || [];
          counts[key] = data[key].length;
        } catch (tableErr) {
          console.error(`[BackupService] Error querying table "${key}":`, tableErr.message);
          throw tableErr;
        }
      }

      const timestamp = new Date().toISOString();
      const formattedDate = timestamp.replace(/[:.]/g, '-');
      const filename = `backup-${formattedDate}.json.gz`;
      const localFilePath = path.join(BACKUPS_DIR, filename);

      const backupPayload = {
        metadata: {
          timestamp,
          triggerType,
          database: 'H&S Monolith Database',
          schemaVersion: '1.0',
          totalRecords: Object.values(counts).reduce((a, b) => a + b, 0),
          counts
        },
        data: {
          users: data.users,
          addresses: data.addresses,
          categories: data.categories,
          drops: data.drops,
          products: data.products,
          reviews: data.reviews,
          carts: data.carts,
          cartItems: data.cartItems,
          orders: data.orders,
          orderItems: data.orderItems,
          manufacturerAdjustments: data.manufacturerAdjustments,
          coupons: data.coupons,
          settings: data.settings
        }
      };

      // 2. Compress data with gzip
      const jsonString = JSON.stringify(backupPayload);
      const compressedBuffer = await gzipAsync(Buffer.from(jsonString, 'utf-8'));

      // 3. Write locally to disk
      await fs.writeFile(localFilePath, compressedBuffer);
      const fileStats = await fs.stat(localFilePath);

      console.log(`[BackupService] Backup written locally: ${filename} (${(fileStats.size / 1024).toFixed(1)} KB) in ${Date.now() - startTime}ms`);

      // 4. Also upload copy to Supabase Storage if configured
      let cloudUploadSuccess = false;
      let cloudPath = null;
      try {
        if (supabase && process.env.SUPABASE_URL) {
          // Ensure bucket exists
          await supabase.storage.createBucket(BACKUP_BUCKET, { public: false }).catch(() => {});
          const storagePath = `hourly/${filename}`;
          const { error: uploadErr } = await supabase.storage
            .from(BACKUP_BUCKET)
            .upload(storagePath, compressedBuffer, {
              contentType: 'application/gzip',
              upsert: true
            });

          if (!uploadErr) {
            cloudUploadSuccess = true;
            cloudPath = `${BACKUP_BUCKET}/${storagePath}`;
            console.log(`[BackupService] Cloud backup saved to Supabase Storage: ${cloudPath}`);
          } else {
            console.warn('[BackupService] Cloud backup note:', uploadErr.message);
          }
        }
      } catch (cloudErr) {
        console.warn('[BackupService] Cloud upload skipped:', cloudErr.message);
      }

      // 5. Prune old local backups (keep last 48 hourly backups)
      await pruneOldBackups(48);

      const result = {
        success: true,
        filename,
        localPath: localFilePath,
        sizeBytes: fileStats.size,
        sizeKB: (fileStats.size / 1024).toFixed(1),
        timestamp,
        counts,
        cloudUploaded: cloudUploadSuccess,
        cloudPath
      };

      // Update manifest file
      await updateManifest(result);

      return result;
    } catch (error) {
      console.error('[BackupService] Error during database backup:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    } finally {
      activeBackupPromise = null;
    }
  })();

  return activeBackupPromise;
};

/**
 * Prune old local backups keeping the latest N backups.
 */
const pruneOldBackups = async (keepCount = 48) => {
  try {
    const files = await fs.readdir(BACKUPS_DIR);
    const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.json.gz'));

    if (backupFiles.length > keepCount) {
      backupFiles.sort(); // Lexicographical sort works because of ISO timestamp format
      const filesToDelete = backupFiles.slice(0, backupFiles.length - keepCount);
      for (const file of filesToDelete) {
        await fs.unlink(path.join(BACKUPS_DIR, file)).catch(() => {});
        console.log(`[BackupService] Pruned old backup: ${file}`);
      }
    }
  } catch (err) {
    console.warn('[BackupService] Prune warning:', err.message);
  }
};

/**
 * Updates a manifest.json file containing latest backup info.
 */
const updateManifest = async (lastBackupResult) => {
  try {
    const manifestPath = path.join(BACKUPS_DIR, 'manifest.json');
    const history = [];
    try {
      const existing = await fs.readFile(manifestPath, 'utf-8');
      const parsed = JSON.parse(existing);
      if (Array.isArray(parsed.history)) {
        history.push(...parsed.history.slice(-20)); // keep last 20 in history
      }
    } catch (e) {}

    history.push({
      filename: lastBackupResult.filename,
      timestamp: lastBackupResult.timestamp,
      sizeKB: lastBackupResult.sizeKB,
      counts: lastBackupResult.counts,
      cloudUploaded: lastBackupResult.cloudUploaded
    });

    const manifestData = {
      lastBackup: lastBackupResult,
      totalBackupsRetained: (await fs.readdir(BACKUPS_DIR)).filter(f => f.endsWith('.json.gz')).length,
      history
    };

    await fs.writeFile(manifestPath, JSON.stringify(manifestData, null, 2), 'utf-8');
  } catch (err) {
    // Non-critical
  }
};

/**
 * Lists available local backups.
 */
export const listBackups = async () => {
  await ensureBackupDir();
  try {
    const files = await fs.readdir(BACKUPS_DIR);
    const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.json.gz'));
    const details = [];

    for (const f of backupFiles) {
      const stat = await fs.stat(path.join(BACKUPS_DIR, f)).catch(() => null);
      if (stat) {
        details.push({
          filename: f,
          sizeBytes: stat.size,
          sizeKB: (stat.size / 1024).toFixed(1),
          createdAt: stat.birthtime || stat.mtime
        });
      }
    }

    details.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return details;
  } catch (err) {
    console.error('[BackupService] Error listing backups:', err);
    return [];
  }
};

let hourlyBackupTimer = null;
let startupBackupTimeout = null;

/**
 * Starts the automated 1-hour database backup scheduler.
 */
export const startHourlyBackupScheduler = () => {
  stopHourlyBackupScheduler();

  console.log('[BackupService] Initializing 1-hour automated database backup scheduler...');

  // Run initial baseline backup after 15 seconds of server startup
  startupBackupTimeout = setTimeout(() => {
    startupBackupTimeout = null;
    performBackup('STARTUP_INITIAL')
      .then(res => {
        if (res.success) {
          console.log(`[BackupService] Initial baseline backup completed successfully: ${res.filename}`);
        }
      })
      .catch(err => console.error('[BackupService] Initial backup error:', err.message));
  }, 15000);

  // Recurring 1-hour interval timer
  hourlyBackupTimer = setInterval(() => {
    performBackup('SCHEDULED_HOURLY')
      .then(res => {
        if (res.success) {
          console.log(`[BackupService] Hourly backup completed: ${res.filename} (Next backup in 1 hour)`);
        }
      })
      .catch(err => console.error('[BackupService] Scheduled hourly backup error:', err.message));
  }, HOURLY_INTERVAL_MS);

  if (hourlyBackupTimer.unref) {
    hourlyBackupTimer.unref(); // Don't prevent clean Node.js exit
  }

  console.log('[BackupService] Hourly backup scheduler is ACTIVE (runs every 60 minutes).');
};

/**
 * Stops the hourly backup scheduler if needed.
 */
export const stopHourlyBackupScheduler = () => {
  if (startupBackupTimeout) {
    clearTimeout(startupBackupTimeout);
    startupBackupTimeout = null;
  }
  if (hourlyBackupTimer) {
    clearInterval(hourlyBackupTimer);
    hourlyBackupTimer = null;
    console.log('[BackupService] Hourly backup scheduler stopped.');
  }
};
