/**
 * report.service.js
 * Generates a structured external/police report for eligible complaints.
 * IMPORTANT: This never auto-files anything. Student must review and submit manually.
 */
const { readData, writeData } = require('./db');
const { addAuditLog } = require('./audit.service');

const OFFICIAL_ROUTES = {
  ragging: [
    { name: 'UGC Anti-Ragging Helpline', contact: '1800-180-5522 (toll-free)', url: 'https://www.antiragging.in' },
    { name: 'National Anti-Ragging Helpline', contact: '1800-180-5522' },
    { name: 'Local Police Station', contact: 'Dial 100' },
  ],
  harassment: [
    { name: 'National Commission for Women Helpline', contact: '7827170170' },
    { name: 'Women Helpline', contact: 'Dial 1091' },
    { name: 'Local Police Station', contact: 'Dial 100' },
  ],
  threat_assault: [
    { name: 'Police Emergency', contact: 'Dial 100' },
    { name: 'Ambulance / Medical Emergency', contact: 'Dial 108' },
    { name: 'Women Helpline', contact: 'Dial 1091' },
  ],
};

function generateExternalReport(complaintId, requestedByUserId) {
  const complaints = readData('complaints');
  const complaint = complaints.find((c) => c.id === complaintId);
  if (!complaint) throw Object.assign(new Error('Complaint not found'), { status: 404 });

  if (!complaint.isExternalReportEligible) {
    throw Object.assign(new Error('This complaint is not eligible for external reporting'), { status: 400 });
  }

  const users = readData('users');
  const student = users.find((u) => u.id === complaint.studentId);

  const report = {
    reportId: `EXT-${complaint.id}-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    disclaimer:
      'IMPORTANT: This report has NOT been automatically filed with any police or external authority. ' +
      'You must review this report and personally submit it through the official channel of your choice. ' +
      'The college system has no authority to file a report on your behalf without an official integration.',
    complaintId: complaint.id,
    category: complaint.category,
    severity: complaint.severity,
    description: complaint.description,
    location: complaint.location,
    incidentReportedAt: complaint.createdAt,
    student: {
      name: student?.name,
      email: student?.collegeEmail,
      mobile: complaint.mobile,
    },
    timeline: complaint.timeline || [],
    stages: complaint.stages || [],
    escalation: complaint.escalation || null,
    officialRoutes: OFFICIAL_ROUTES[complaint.category] || [{ name: 'Local Police Station', contact: 'Dial 100' }],
  };

  // Save report reference to complaint
  const idx = complaints.findIndex((c) => c.id === complaintId);
  complaints[idx].externalReport = {
    reportId: report.reportId,
    generatedAt: report.generatedAt,
    requestedBy: requestedByUserId,
  };
  writeData('complaints', complaints);

  addAuditLog('EXTERNAL_REPORT_GENERATED', complaintId, requestedByUserId, { reportId: report.reportId });

  return report;
}

module.exports = { generateExternalReport };
