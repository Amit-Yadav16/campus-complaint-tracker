const {
  createComplaint,
  getComplaints,
  getComplaintById,
  completeStage,
  submitResolution,
  confirmResolution,
} = require('../services/complaint.service');

// GET /api/complaints
function list(req, res) {
  try {
    const complaints = getComplaints(req.user, req.query);
    res.json({ complaints });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

// POST /api/complaints
async function create(req, res) {
  try {
    const complaint = createComplaint(req.user.id, req.body);
    res.status(201).json({ complaint });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

// GET /api/complaints/:id
function getOne(req, res) {
  try {
    const complaint = getComplaintById(req.params.id, req.user);
    res.json({ complaint });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

// PATCH /api/complaints/:id/stage
function patchStage(req, res) {
  try {
    const complaint = completeStage(req.params.id, req.user, req.body.note);
    res.json({ complaint });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

// POST /api/complaints/:id/resolution
function postResolution(req, res) {
  try {
    const complaint = submitResolution(req.params.id, req.user, req.body.description);
    res.json({ complaint });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

// POST /api/complaints/:id/confirm
function postConfirm(req, res) {
  try {
    const complaint = confirmResolution(req.params.id, req.user.id, req.body.response);
    res.json({ complaint });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { list, create, getOne, patchStage, postResolution, postConfirm };
