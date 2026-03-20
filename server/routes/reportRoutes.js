const express = require('express');
const router = express.Router();
const { createReport, getReports, getReportById, updateReport, deleteReport, exportPDF, exportExcel, getAnalytics } = require('../controllers/reportController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', [auth, upload.array('attachments')], createReport);
// Respond to preflight requests for export endpoints
router.options('/export/pdf', (req, res) => {
	const origin = req.headers.origin || process.env.CLIENT_URL || '*';
	res.setHeader('Access-Control-Allow-Origin', origin);
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, Accept');
	res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
	res.sendStatus(204);
});
router.options('/export/excel', (req, res) => {
	const origin = req.headers.origin || process.env.CLIENT_URL || '*';
	res.setHeader('Access-Control-Allow-Origin', origin);
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, Accept');
	res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
	res.sendStatus(204);
});
router.get('/', auth, getReports);
router.get('/analytics', auth, getAnalytics);
router.get('/export/pdf', auth, exportPDF);
router.get('/export/excel', auth, exportExcel);
router.get('/:id', auth, getReportById);
router.put('/:id', auth, updateReport);
router.delete('/:id', auth, deleteReport);

module.exports = router;
