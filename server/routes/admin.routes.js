const router = require('express').Router();
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');
const { dashboard, complaints, rules } = require('../controllers/admin.controller');

router.use(authMiddleware, requireRole('admin', 'hod'));

router.get('/dashboard', dashboard);
router.get('/complaints', complaints);
router.get('/rules', rules);

module.exports = router;
