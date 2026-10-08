/**
 * escalation.service.js
 * Lazy SLA-breach detection and escalation to HOD.
 * Called on every complaint read — no cron needed for prototype.
 */
const { readData, writeData } = require('./db');
const { getSlaStatus } = require('./sla.service');
const { createNotification } = require('./notification.service');
const { addAuditLog } = require('./audit.service');

const SKIP_STATUSES = ['closed', 'escalated_to_hod', 'awaiting_student_confirmation', 'reopened'];

/**
 * Check if a complaint needs escalation and mutate DB if so.
 * Returns the (possibly updated) complaint object.
 */
function checkAndEscalate(complaint) {
  if (SKIP_STATUSES.includes(complaint.status)) return complaint;

  const slaStatus = getSlaStatus(complaint);
  if (slaStatus !== 'overdue') return complaint;

  return escalateToHod(complaint, 'SLA deadline exceeded');
}

function escalateToHod(complaint, reason) {
  const complaints = readData('complaints');
  const idx = complaints.findIndex((c) => c.id === complaint.id);
  if (idx === -1) return complaint;

  const now = new Date().toISOString();

  const updated = {
    ...complaints[idx],
    status: 'escalated_to_hod',
    slaStatus: 'overdue',
    escalation: {
      escalatedAt: now,
      escalatedBy: 'system',
      reason,
      hodActionAt: null,
      hodNote: '',
    },
    timeline: [
      ...(complaints[idx].timeline || []),
      { event: 'Escalated to HOD', timestamp: now, by: 'system', note: reason },
    ],
  };

  complaints[idx] = updated;
  writeData('complaints', complaints);

  // Notify HODs
  const users = readData('users');
  users.filter((u) => u.role === 'hod').forEach((hod) => {
    createNotification(hod.id, 'warning',
      `Complaint ${complaint.id} escalated: ${reason}`, complaint.id);
  });

  // Notify student
  createNotification(complaint.studentId, 'warning',
    `Your complaint ${complaint.id} was escalated to HOD due to SLA breach.`, complaint.id);

  addAuditLog('ESCALATED_TO_HOD', complaint.id, 'system', { reason });

  return updated;
}

module.exports = { checkAndEscalate, escalateToHod };
