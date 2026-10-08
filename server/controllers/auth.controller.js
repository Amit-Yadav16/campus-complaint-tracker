const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readData, writeData } = require('../services/db');

const COLLEGE_EMAIL_DOMAIN = '@college.edu'; // make configurable via .env later

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // ── Input validation ──────────────────────────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ── College-email domain check (backend enforced, not just browser) ───────
    if (!normalizedEmail.endsWith(COLLEGE_EMAIL_DOMAIN)) {
      return res.status(403).json({
        error: `Only approved college emails (${COLLEGE_EMAIL_DOMAIN}) are allowed.`,
      });
    }

    // ── Find user ─────────────────────────────────────────────────────────────
    const users = readData('users');
    const user = users.find((u) => u.collegeEmail.toLowerCase() === normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // ── Password check ────────────────────────────────────────────────────────
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // ── Issue JWT ─────────────────────────────────────────────────────────────
    const payload = { id: user.id, role: user.role, email: user.collegeEmail };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    // ── Return safe user object (never send passwordHash) ─────────────────────
    const safeUser = {
      id: user.id,
      name: user.name,
      collegeEmail: user.collegeEmail,
      mobile: user.mobile,
      role: user.role,
      department: user.department || null,
    };

    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error('[auth/login]', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
function me(req, res) {
  // req.user is attached by authMiddleware
  const users = readData('users');
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const safeUser = {
    id: user.id,
    name: user.name,
    collegeEmail: user.collegeEmail,
    mobile: user.mobile,
    role: user.role,
    department: user.department || null,
  };
  return res.json({ user: safeUser });
}

/**
 * POST /api/auth/logout
 * JWT is stateless — client just drops the token.
 * This endpoint exists so the client has a clean API call to signal logout.
 */
function logout(_req, res) {
  return res.json({ message: 'Logged out successfully.' });
}

module.exports = { login, me, logout };
