const { getComplaints, getMetrics } = require('../services/complaint.service');

// GET /api/hod/dashboard
function dashboard(req, res) {
  try {
    const metrics = getMetrics(req.user);
    const escalated = getComplaints(req.user, { status: 'escalated_to_hod' });
    const awaiting = getComplaints(req.user, { status: 'awaiting_student_confirmation' });
    res.json({ metrics, escalated, awaiting });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

// GET /api/hod/escalated
function escalated(req, res) {
  try {
    const complaints = getComplaints(req.user, { status: 'escalated_to_hod' });
    res.json({ complaints });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { dashboard, escalated };
