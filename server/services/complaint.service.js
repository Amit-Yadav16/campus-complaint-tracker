/**
 * complaint.service.js
 * Core business logic for complaint lifecycle:
 * create → stage progression → resolution proposal → student confirmation.
 * SLA is checked lazily on every read.
 */
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('./db');
const { determineRules, isAuthorisedToAct } = require('./ruleEngine.service');
const { calculateSlaDeadline, getSlaStatus } = require('./sla.service');
const { checkAndEscalate } = require('./escalation.service');
const { createNotification } = require('./notification.service');
const { addAuditLog } = require('./audit.service');

// ── ID generation ─────────────────────────────────────────────────────────────
function generateComplaintId() {
  const year = new Date().getFullYear();
  const complaints = readData('complaints');
  const yearComplaints = complaints.filter((c) => c.id.startsWith(`CMP-${year}-`));
  return `CMP-${year}-${String(yearComplaints.length + 1).padStart(5, '0')}`;
}

// ── Enrich complaint with live SLA status (read-only) ─────────────────────────
function enrichWithSla(complaint) {
  return { ...complaint, slaStatus: getSlaStatus(complaint) };
}

// ── CREATE ────────────────────────────────────────────────────────────────────
function createComplaint(studentId, body) {
  const { category, description, location, mobile, evidenceNote } = body;

  if (!category || !description || !location || !mobile) {
    throw Object.assign(new Error('category, description, location and mobile are required'), { status: 400 });
  }

  const rules = determineRules(category);
  const now = new Date().toISOString();
  const id = generateComplaintId();
  const slaDeadline = calculateSlaDeadline(rules.severity);

  const complaint = {
    id,
    studentId,
    category,
    description,
    location,
    mobile,
    evidenceNote: evidenceNote || '',
    severity: rules.severity,
    status: 'submitted',
    stages: [
      { name: 'Received', completedAt: now, completedBy: 'system', note: 'Complaint submitted by student' },
    ],
    currentStageIndex: 0,
    stageTemplate: rules.stages,
    createdAt: now,
    slaDeadline: slaDeadline.toISOString(),
    slaStatus: 'on_track',
    escalation: null,
    resolution: null,
    confirmation: null,
    externalReport: null,
    departmentId: rules.departmentId,
    assignedAdminId: null,
    isExternalReportEligible: rules.externalReportEligible,
    timeline: [
      {
        event: 'Complaint submitted',
        timestamp: now,
        by: 'system',
        note: `Category: ${rules.categoryLabel} | Severity: ${rules.severity} | SLA: ${rules.slaWorkingDays} working days`,
      },
    ],
  };

  const complaints = readData('complaints');
  complaints.push(complaint);
  writeData('complaints', complaints);

  addAuditLog('COMPLAINT_CREATED', id, studentId, { category, severity: rules.severity });

  // Notify admins in the department
  const users = readData('users');
  users
    .filter((u) => u.role === 'admin')
    .forEach((admin) => {
      createNotification(admin.id, 'info', `New complaint ${id} submitted (${rules.categoryLabel})`, id);
    });

  return enrichWithSla(complaint);
}

// ── LIST ──────────────────────────────────────────────────────────────────────
function getComplaints(user, filters = {}) {
  let complaints = readData('complaints');

  // Role-based filtering
  if (user.role === 'student') {
    complaints = complaints.filter((c) => c.studentId === user.id);
  } else if (user.role === 'admin') {
    const departments = readData('departments');
    const adminDepts = departments.filter((d) => d.adminIds.includes(user.id)).map((d) => d.id);
    complaints = complaints.filter((c) => adminDepts.includes(c.departmentId));
  }
  // HOD sees all

  // Run lazy escalation check on each
  complaints = complaints.map((c) => checkAndEscalate(c));

  // Apply query filters
  if (filters.status) complaints = complaints.filter((c) => c.status === filters.status);
  if (filters.severity) complaints = complaints.filter((c) => c.severity === filters.severity);
  if (filters.category) complaints = complaints.filter((c) => c.category === filters.category);

  // Sort newest first
  complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return complaints.map(enrichWithSla);
}

// ── GET BY ID ─────────────────────────────────────────────────────────────────
function getComplaintById(id, user) {
  const complaints = readData('complaints');
  let complaint = complaints.find((c) => c.id === id);
  if (!complaint) throw Object.assign(new Error('Complaint not found'), { status: 404 });

  // Students can only see their own
  if (user.role === 'student' && complaint.studentId !== user.id) {
    throw Object.assign(new Error('Access denied'), { status: 403 });
  }

  // Lazy escalation check
  complaint = checkAndEscalate(complaint);

  return enrichWithSla(complaint);
}

// ── COMPLETE STAGE ────────────────────────────────────────────────────────────
function completeStage(id, user, note = '') {
  const complaints = readData('complaints');
  const idx = complaints.findIndex((c) => c.id === id);
  if (idx === -1) throw Object.assign(new Error('Complaint not found'), { status: 404 });

  let complaint = complaints[idx];

  // Auth check
  if (!isAuthorisedToAct(complaint, user)) {
    throw Object.assign(new Error('You are not authorised to act on this complaint'), { status: 403 });
  }

  const blockStatuses = ['closed', 'awaiting_student_confirmation'];
  if (blockStatuses.includes(complaint.status)) {
    throw Object.assign(new Error(`Cannot advance stage while complaint is ${complaint.status}`), { status: 400 });
  }

  const stageTemplate = complaint.stageTemplate;
  const nextStageIndex = complaint.currentStageIndex + 1;

  // "Resolution Proposed" is the last stage — handled by /resolution endpoint
  const lastActionableIndex = stageTemplate.length - 2; // second-to-last is the last admin stage
  if (complaint.currentStageIndex >= lastActionableIndex) {
    throw Object.assign(
      new Error('Use the /resolution endpoint to submit the final resolution proposal'),
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const nextStageName = stageTemplate[nextStageIndex];

  // Mark current stage complete and open next stage
  const updatedStages = [...complaint.stages];
  updatedStages.push({ name: nextStageName, completedAt: null, completedBy: null, note: '' });

  // The just-completed stage gets the note
  const currentStageEntry = updatedStages[updatedStages.length - 2];
  if (currentStageEntry && !currentStageEntry.completedAt) {
    currentStageEntry.completedAt = now;
    currentStageEntry.completedBy = user.id;
    currentStageEntry.note = note;
  }

  const updatedTimeline = [
    ...(complaint.timeline || []),
    { event: `Stage completed: ${stageTemplate[complaint.currentStageIndex]}`, timestamp: now, by: user.id, note },
    { event: `Stage started: ${nextStageName}`, timestamp: now, by: 'system', note: '' },
  ];

  // HOD action timestamp
  let escalation = complaint.escalation;
  if (complaint.status === 'escalated_to_hod' && user.role === 'hod' && escalation) {
    escalation = { ...escalation, hodActionAt: now, hodNote: note };
  }

  complaints[idx] = {
    ...complaint,
    stages: updatedStages,
    currentStageIndex: nextStageIndex,
    status: 'in_progress',
    slaStatus: getSlaStatus(complaint),
    escalation,
    timeline: updatedTimeline,
  };

  writeData('complaints', complaints);
  addAuditLog('STAGE_COMPLETED', id, user.id, {
    stage: stageTemplate[complaint.currentStageIndex],
    nextStage: nextStageName,
    note,
  });

  // Notify student
  createNotification(complaint.studentId, 'info',
    `Complaint ${id}: Stage "${stageTemplate[complaint.currentStageIndex]}" completed. Now at: "${nextStageName}".`, id);

  return enrichWithSla(complaints[idx]);
}

// ── SUBMIT RESOLUTION PROPOSAL ─────────────────────────────────────────────────
function submitResolution(id, user, description) {
  if (!description?.trim()) {
    throw Object.assign(new Error('Resolution description is required'), { status: 400 });
  }

  const complaints = readData('complaints');
  const idx = complaints.findIndex((c) => c.id === id);
  if (idx === -1) throw Object.assign(new Error('Complaint not found'), { status: 404 });

  const complaint = complaints[idx];

  if (!isAuthorisedToAct(complaint, user)) {
    throw Object.assign(new Error('Not authorised'), { status: 403 });
  }

  const blockStatuses = ['closed', 'awaiting_student_confirmation'];
  if (blockStatuses.includes(complaint.status)) {
    throw Object.assign(new Error(`Cannot propose resolution while complaint is ${complaint.status}`), { status: 400 });
  }

  const now = new Date().toISOString();

  // Complete the last admin stage (second-to-last in template)
  const stageTemplate = complaint.stageTemplate;
  const resolutionStageIndex = stageTemplate.length - 1;
  const updatedStages = [...complaint.stages];

  // Close any open stage
  const lastStage = updatedStages[updatedStages.length - 1];
  if (lastStage && !lastStage.completedAt) {
    lastStage.completedAt = now;
    lastStage.completedBy = user.id;
    lastStage.note = 'Resolution proposed';
  }
  // Add Resolution Proposed stage as completed
  updatedStages.push({
    name: stageTemplate[resolutionStageIndex],
    completedAt: now,
    completedBy: user.id,
    note: description,
  });

  complaints[idx] = {
    ...complaint,
    stages: updatedStages,
    currentStageIndex: resolutionStageIndex,
    status: 'awaiting_student_confirmation',
    resolution: { proposedAt: now, proposedBy: user.id, description, studentResponse: null, respondedAt: null },
    timeline: [
      ...(complaint.timeline || []),
      { event: 'Resolution proposed', timestamp: now, by: user.id, note: description },
      { event: 'Awaiting student confirmation', timestamp: now, by: 'system', note: 'Student must confirm YES or NO' },
    ],
  };

  writeData('complaints', complaints);
  addAuditLog('RESOLUTION_PROPOSED', id, user.id, { description });

  // Notify student
  createNotification(complaint.studentId, 'info',
    `Complaint ${id}: A resolution has been proposed. Please confirm if your issue is resolved.`, id);

  return enrichWithSla(complaints[idx]);
}

// ── STUDENT CONFIRMATION ───────────────────────────────────────────────────────
function confirmResolution(id, studentId, response) {
  if (!['yes', 'no'].includes(response?.toLowerCase())) {
    throw Object.assign(new Error('Response must be "yes" or "no"'), { status: 400 });
  }

  const complaints = readData('complaints');
  const idx = complaints.findIndex((c) => c.id === id);
  if (idx === -1) throw Object.assign(new Error('Complaint not found'), { status: 404 });

  const complaint = complaints[idx];

  if (complaint.studentId !== studentId) {
    throw Object.assign(new Error('Only the complaint owner can confirm resolution'), { status: 403 });
  }

  if (complaint.status !== 'awaiting_student_confirmation') {
    throw Object.assign(new Error('Complaint is not awaiting confirmation'), { status: 400 });
  }

  const now = new Date().toISOString();
  const isYes = response.toLowerCase() === 'yes';

  const updatedResolution = {
    ...complaint.resolution,
    studentResponse: isYes ? 'yes' : 'no',
    respondedAt: now,
  };

  let newStatus, timelineEvent, notifMessage;
  if (isYes) {
    newStatus = 'closed';
    timelineEvent = 'Student confirmed: Issue resolved ✅';
    notifMessage = `Complaint ${id} has been closed. Thank you for your feedback.`;
  } else {
    newStatus = 'reopened';
    timelineEvent = 'Student rejected: Issue NOT resolved ❌ — complaint reopened';
    notifMessage = `Complaint ${id} has been reopened as the student reported the issue is not resolved.`;
  }

  complaints[idx] = {
    ...complaint,
    status: newStatus,
    resolution: updatedResolution,
    // Reset escalation tracking if reopened so it can re-escalate fresh
    ...(isYes ? {} : { escalation: null }),
    timeline: [
      ...(complaint.timeline || []),
      { event: timelineEvent, timestamp: now, by: studentId, note: '' },
    ],
  };

  writeData('complaints', complaints);
  addAuditLog('STUDENT_CONFIRMATION', id, studentId, { response, newStatus });

  // Notify admins / HOD
  const users = readData('users');
  users.filter((u) => u.role !== 'student').forEach((u) => {
    createNotification(u.id, isYes ? 'success' : 'warning', notifMessage, id);
  });

  return enrichWithSla(complaints[idx]);
}

// ── DASHBOARD METRICS ─────────────────────────────────────────────────────────
function getMetrics(user) {
  const all = getComplaints(user);

  const count = (pred) => all.filter(pred).length;

  return {
    total: all.length,
    bySeverity: {
      normal: count((c) => c.severity === 'normal'),
      high: count((c) => c.severity === 'high'),
      critical: count((c) => c.severity === 'critical'),
    },
    byStatus: {
      submitted: count((c) => c.status === 'submitted'),
      in_progress: count((c) => c.status === 'in_progress'),
      overdue: count((c) => c.slaStatus === 'overdue' && !['closed', 'awaiting_student_confirmation'].includes(c.status)),
      escalated_to_hod: count((c) => c.status === 'escalated_to_hod'),
      awaiting_student_confirmation: count((c) => c.status === 'awaiting_student_confirmation'),
      reopened: count((c) => c.status === 'reopened'),
      closed: count((c) => c.status === 'closed'),
    },
    byCategory: Object.fromEntries(
      [...new Set(all.map((c) => c.category))].map((cat) => [cat, count((c) => c.category === cat)])
    ),
  };
}

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  completeStage,
  submitResolution,
  confirmResolution,
  getMetrics,
};
