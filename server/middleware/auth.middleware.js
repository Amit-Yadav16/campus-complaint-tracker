const jwt = require('jsonwebtoken');

/**
 * authMiddleware
 * Verifies the Bearer JWT and attaches req.user = { id, role, email }
 * Must be used on any route that requires authentication.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token. Please log in.' });
  }
}

/**
 * requireRole(...roles)
 * Usage: router.get('/route', authMiddleware, requireRole('admin', 'hod'), handler)
 * Must be placed AFTER authMiddleware so req.user is already set.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires role: ${roles.join(' or ')}.`,
      });
    }
    return next();
  };
}

module.exports = { authMiddleware, requireRole };
