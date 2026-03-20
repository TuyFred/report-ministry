const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const reportFormController = require('../controllers/reportFormController');

const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ msg: 'Admin access required' });
    }
    return next();
};

// Anyone authenticated can read the active template (used by member/leader/admin UIs)
router.get('/active', auth, reportFormController.getActive);

// Admin CRUD
router.get('/', auth, requireAdmin, reportFormController.list);
router.get('/defaults', auth, requireAdmin, reportFormController.getDefaults);
router.post('/', auth, requireAdmin, reportFormController.create);
router.put('/:id', auth, requireAdmin, reportFormController.update);
router.delete('/:id', auth, requireAdmin, reportFormController.remove);
router.post('/:id/activate', auth, requireAdmin, reportFormController.activate);

module.exports = router;
