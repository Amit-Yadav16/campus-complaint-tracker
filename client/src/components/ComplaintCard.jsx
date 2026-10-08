import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import SeverityBadge from './SeverityBadge';

const CATEGORY_LABELS = {
  campus_maintenance: 'Campus Maintenance', hostel: 'Hostel',
  academic: 'Academic', examination: 'Examination',
  ragging: 'Ragging', harassment: 'Harassment',
  threat_assault: 'Threat / Assault', administration: 'Administration', other: 'Other',
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ComplaintCard({ complaint, linkPrefix = '/student' }) {
  const { id, category, description, severity, status, slaStatus, createdAt, location } = complaint;

  return (
    <Link
      to={`${linkPrefix}/complaints/${id}`}
      className="block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition group"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-mono text-gray-400">{id}</span>
            <SeverityBadge severity={severity} />
            {slaStatus === 'at_risk' && (
              <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded font-medium">⚠ At Risk</span>
            )}
            {slaStatus === 'overdue' && (
              <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-medium">🔴 Overdue</span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-700 transition">
            {CATEGORY_LABELS[category] || category} — {location}
          </p>
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{description}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusBadge status={status} />
          <span className="text-xs text-gray-400">{formatDate(createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
