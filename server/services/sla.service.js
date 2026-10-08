/**
 * sla.service.js
 * Working-day SLA calculation, deadline computation, and status detection.
 */
const { readData } = require('./db');

/**
 * Adds N working days to startDate and returns deadline (at end-of-work-hour).
 */
function addWorkingDays(startDate, days) {
  const rules = readData('rules');
  const workingDays = rules.workingHours.workingDays; // [1,2,3,4,5] Mon-Fri
  const endHour = rules.workingHours.endHour;         // 18

  const result = new Date(startDate);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (workingDays.includes(result.getDay())) added++;
  }
  result.setHours(endHour, 0, 0, 0);
  return result;
}

/**
 * Calculate SLA deadline from now for the given severity.
 */
function calculateSlaDeadline(severity) {
  const rules = readData('rules');
  const days = rules.sla[severity]?.workingDays ?? 7;
  return addWorkingDays(new Date(), days);
}

/**
 * Returns 'on_track' | 'at_risk' | 'overdue' | 'completed'.
 * Does NOT write to DB — read-only.
 */
function getSlaStatus(complaint) {
  const terminalStatuses = ['closed', 'awaiting_student_confirmation'];
  if (terminalStatuses.includes(complaint.status)) return 'completed';

  const now = new Date();
  const deadline = new Date(complaint.slaDeadline);
  if (now >= deadline) return 'overdue';

  const created = new Date(complaint.createdAt);
  const totalMs = deadline - created;
  const elapsedMs = now - created;
  const elapsedPercent = (elapsedMs / totalMs) * 100;

  const rules = readData('rules');
  const threshold = rules.sla[complaint.severity]?.warningThresholdPercent ?? 80;

  return elapsedPercent >= threshold ? 'at_risk' : 'on_track';
}

/**
 * Human-readable time-remaining string.
 */
function getTimeRemaining(slaDeadline) {
  const now = new Date();
  const deadline = new Date(slaDeadline);
  const diffMs = deadline - now;

  if (diffMs <= 0) {
    const overdueMs = Math.abs(diffMs);
    const overdueHours = Math.floor(overdueMs / 3600000);
    const overdueDays = Math.floor(overdueHours / 24);
    return {
      overdue: true,
      text: overdueDays > 0 ? `${overdueDays}d ${overdueHours % 24}h overdue` : `${overdueHours}h overdue`,
    };
  }

  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(hours / 24);
  return {
    overdue: false,
    text: days > 0 ? `${days}d ${hours % 24}h remaining` : `${hours}h remaining`,
  };
}

module.exports = { addWorkingDays, calculateSlaDeadline, getSlaStatus, getTimeRemaining };
