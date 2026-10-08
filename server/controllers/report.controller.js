const { generateExternalReport } = require('../services/report.service');
const { getComplaints } = require('../services/complaint.service');

// POST /api/reports/external  — body: { complaintId }
function externalReport(req, res) {
  try {
    const { complaintId } = req.body;
    if (!complaintId) return res.status(400).json({ error: 'complaintId is required' });
    const report = generateExternalReport(complaintId, req.user.id);
    res.json({ report });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

// GET /api/reports/summary  — admin/HOD summary
function summary(req, res) {
  try {
    const complaints = getComplaints(req.user);
    const total = complaints.length;
    const closed = complaints.filter((c) => c.status === 'closed').length;
    const open = complaints.filter((c) => !['closed'].includes(c.status)).length;
    res.json({ total, closed, open });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { externalReport, summary };
