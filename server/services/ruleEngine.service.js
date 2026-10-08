/**
 * ruleEngine.service.js
 * Determines severity, SLA config, stage template, department, and
 * external-report eligibility for a complaint based on rules.json.
 */
const { readData } = require('./db');

/**
 * Returns all rule-engine outputs for a given category.
 * Falls back to 'other' if category is unknown.
 */
function determineRules(category) {
  const rules = readData('rules');
  const departments = readData('departments');

  const catRule = rules.categories[category] || rules.categories['other'];
  const slaConfig = rules.sla[catRule.defaultSeverity];
  const department = departments.find((d) => d.key === category)
    || departments.find((d) => d.key === 'other');

  return {
    severity: catRule.defaultSeverity,
    slaWorkingDays: slaConfig.workingDays,
    slaWarningThresholdPercent: slaConfig.warningThresholdPercent,
    stages: catRule.stages,
    externalReportEligible: catRule.externalReportEligible,
    departmentId: department?.id || null,
    categoryLabel: catRule.label,
  };
}

/**
 * Returns true if a user is authorised to act on a complaint.
 * HOD can act on any. Admin can act only on their department's complaints.
 */
function isAuthorisedToAct(complaint, user) {
  if (user.role === 'hod') return true;
  if (user.role === 'admin') {
    const departments = readData('departments');
    const dept = departments.find((d) => d.id === complaint.departmentId);
    if (!dept) return true;
    return dept.adminIds.includes(user.id);
  }
  return false;
}

module.exports = { determineRules, isAuthorisedToAct };
