const { getComplaints, getMetrics } = require('../services/complaint.service');
const { readData } = require('../services/db');

// GET /api/admin/dashboard
function dashboard(req, res) {
  try {
    const metrics = getMetrics(req.user);
    res.json({ metrics });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

// GET /api/admin/complaints
function complaints(req, res) {
  try {
    const data = getComplaints(req.user, req.query);
    res.json({ complaints: data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

// GET /api/admin/rules
function rules(req, res) {
  try {
    res.json({ rules: readData('rules') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { dashboard, complaints, rules };
