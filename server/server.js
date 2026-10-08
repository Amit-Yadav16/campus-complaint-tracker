require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes         = require('./routes/auth.routes');
const complaintRoutes    = require('./routes/complaint.routes');
const adminRoutes        = require('./routes/admin.routes');
const hodRoutes          = require('./routes/hod.routes');
const reportRoutes       = require('./routes/report.routes');
const notificationRoutes = require('./routes/notification.routes');

const app  = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// ── CORS ──────────────────────────────────────────────────────────────────────
// In production the frontend is served from the same Express origin,
// so we only need wide CORS for the dev proxy setup.
const allowedOrigins = isProd
  ? true                                            // same-origin in prod
  : (process.env.CLIENT_URL || 'http://localhost:5173');

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// ── Static files (production) ─────────────────────────────────────────────────
if (isProd) {
  const distPath = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(distPath));
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/complaints',    complaintRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/hod',           hodRoutes);
app.use('/api/reports',       reportRoutes);
app.use('/api/notifications', notificationRoutes);

// ── SPA fallback (production) — serves index.html for all non-API routes ──────
if (isProd) {
  const distPath = path.join(__dirname, '..', 'client', 'dist');
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Dev: 404 for unknown API routes
  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Campus Complaint Tracker running on port ${PORT} [${isProd ? 'production' : 'development'}]`);
});
