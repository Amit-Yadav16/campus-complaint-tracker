const router = require('express').Router();
const { login, me, logout } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// POST /api/auth/login  — public
router.post('/login', login);

// POST /api/auth/logout — public (JWT is stateless; client drops token)
router.post('/logout', logout);

// GET  /api/auth/me     — protected: returns current user profile
router.get('/me', authMiddleware, me);

module.exports = router;
