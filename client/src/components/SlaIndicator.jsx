const SLA_CONFIG = {
  on_track:  { label: 'On Track',  bar: 'bg-green-500',  text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  at_risk:   { label: 'At Risk',   bar: 'bg-yellow-500', text: 'text-yellow-700',bg: 'bg-yellow-50',border: 'border-yellow-200' },
  overdue:   { label: 'Overdue',   bar: 'bg-red-500',    text: 'text-red-700',   bg: 'bg-red-50',   border: 'border-red-200' },
  completed: { label: 'Resolved',  bar: 'bg-gray-400',   text: 'text-gray-500',  bg: 'bg-gray-50',  border: 'border-gray-200' },
};

function getElapsedPercent(createdAt, slaDeadline) {
  const created = new Date(createdAt);
  const deadline = new Date(slaDeadline);
  const now = new Date();
  const total = deadline - created;
  const elapsed = Math.min(now - created, total);
  return total > 0 ? Math.round((elapsed / total) * 100) : 100;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function SlaIndicator({ complaint }) {
  const { slaStatus, slaDeadline, createdAt, severity } = complaint;
  const cfg = SLA_CONFIG[slaStatus] || SLA_CONFIG.on_track;
  const percent = getElapsedPercent(createdAt, slaDeadline);

  return (
    <div className={`rounded-lg border p-3 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold uppercase tracking-wide ${cfg.text}`}>{cfg.label}</span>
        <span className="text-xs text-gray-500 capitalize">{severity} SLA</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
        <div
          className={`h-1.5 rounded-full transition-all ${cfg.bar}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-gray-500">
        <span>Due: {formatDate(slaDeadline)}</span>
        <span>{percent}% elapsed</span>
      </div>
    </div>
  );
}
