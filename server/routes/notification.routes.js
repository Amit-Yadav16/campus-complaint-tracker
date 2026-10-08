const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { getForUser, markRead, markAllRead } = require('../services/notification.service');

// All mounted at /api/notifications
router.use(authMiddleware);

// GET /api/notifications
router.get('/', (req, res) => {
  res.json({ notifications: getForUser(req.user.id) });
});

// PATCH /api/notifications/read-all  ← must come BEFORE /:id/read
router.patch('/read-all', (req, res) => {
  markAllRead(req.user.id);
  res.json({ ok: true });
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', (req, res) => {
  markRead(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
