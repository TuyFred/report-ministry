const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const backupController = require('../controllers/backupController');

// @route   GET api/backup/history
// @desc    Get backup history
// @access  Private (Admin only)
router.get('/history', auth, backupController.getBackupHistory);

// @route   POST api/backup/create
// @desc    Create a new database backup
// @access  Private (Admin only)
router.post('/create', auth, backupController.createBackup);

// @route   GET api/backup/download/:filename
// @desc    Download a backup file
// @access  Private (Admin only)
router.get('/download/:filename', auth, backupController.downloadBackup);

module.exports = router;
