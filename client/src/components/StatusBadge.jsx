const STATUS_CONFIG = {
  submitted:                    { label: 'Submitted',               color: 'bg-gray-100 text-gray-700',     dot: 'bg-gray-400' },
  in_progress:                  { label: 'In Progress',             color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500' },
  overdue:                      { label: 'Overdue',                 color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  escalated_to_hod:             { label: 'Escalated to HOD',        color: 'bg-red-100 text-red-700',       dot: 'bg-red-500' },
  resolution_proposed:          { label: 'Resolution Proposed',     color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  awaiting_student_confirmation:{ label: 'Awaiting Confirmation',   color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  reopened:                     { label: 'Reopened',                color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  closed:                       { label: 'Closed ✓',               color: 'bg-green-100 text-green-700',   dot: 'bg-green-500' },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${textSize} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
