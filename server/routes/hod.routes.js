const router = require('express').Router();
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');
const { dashboard, escalated } = require('../controllers/hod.controller');

router.use(authMiddleware, requireRole('hod'));

router.get('/dashboard', dashboard);
router.get('/escalated', escalated);

module.exports = router;
