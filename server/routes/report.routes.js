const router = require('express').Router();
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');
const { externalReport, summary } = require('../controllers/report.controller');

router.use(authMiddleware);

router.post('/external', externalReport);
router.get('/summary', requireRole('admin', 'hod'), summary);

module.exports = router;
