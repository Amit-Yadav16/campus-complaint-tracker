/**
 * audit.service.js
 * Append-only audit log for all important state changes.
 */
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('./db');

function addAuditLog(action, complaintId, userId, details = {}) {
  const logs = readData('auditLogs');
  logs.push({
    id: uuidv4(),
    action,
    complaintId,
    userId,
    details,
    timestamp: new Date().toISOString(),
  });
  writeData('auditLogs', logs);
}

function getLogsForComplaint(complaintId) {
  return readData('auditLogs')
    .filter((l) => l.complaintId === complaintId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

module.exports = { addAuditLog, getLogsForComplaint };
