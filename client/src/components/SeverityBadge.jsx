const SEV_CONFIG = {
  normal:   { label: 'Normal',   color: 'bg-blue-50 text-blue-600 border border-blue-200' },
  high:     { label: 'High',     color: 'bg-orange-50 text-orange-600 border border-orange-200' },
  critical: { label: 'Critical', color: 'bg-red-50 text-red-600 border border-red-200' },
};

export default function SeverityBadge({ severity }) {
  const cfg = SEV_CONFIG[severity] || { label: severity, color: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}
