import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { adminRoute } from '../middleware/admin.middleware.js';
import { performBackup, listBackups } from '../services/backup.service.js';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUPS_DIR = path.resolve(__dirname, '../../backups/db');

// @desc    List available database backups
// @route   GET /api/backup/list
// @access  Private (Admin)
router.get('/list', protectRoute, adminRoute, async (req, res) => {
  try {
    const backups = await listBackups();
    return res.status(200).json({
      success: true,
      count: backups.length,
      data: backups
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Trigger immediate database backup
// @route   POST /api/backup/now
// @access  Private (Admin)
router.post('/now', protectRoute, adminRoute, async (req, res) => {
  try {
    const result = await performBackup(`ADMIN_TRIGGERED_${req.user.email}`);
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Database backup completed successfully',
        data: result
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.error || 'Backup failed'
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Download a specific backup file
// @route   GET /api/backup/download/:filename
// @access  Private (Admin)
router.get('/download/:filename', protectRoute, adminRoute, (req, res) => {
  const { filename } = req.params;
  if (!filename || !filename.startsWith('backup-') || !filename.endsWith('.json.gz')) {
    return res.status(400).json({ success: false, message: 'Invalid backup filename' });
  }

  const safePath = path.join(BACKUPS_DIR, path.basename(filename));
  return res.download(safePath, filename, (err) => {
    if (err && !res.headersSent) {
      return res.status(404).json({ success: false, message: 'Backup file not found' });
    }
  });
});

export default router;
