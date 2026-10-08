import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ComplaintCard from '../components/ComplaintCard';
import api from '../services/api';

const STATUSES = ['', 'submitted', 'in_progress', 'escalated_to_hod', 'awaiting_student_confirmation', 'reopened', 'closed'];
const SEVERITIES = ['', 'normal', 'high', 'critical'];

function MetricCard({ label, value, icon, highlight }) {
  return (
    <div className={`bg-white border rounded-xl p-4 shadow-sm flex items-center gap-3 ${highlight ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
      <span className="text-2xl">{icon}</span>
      <div>
        <p className={`text-2xl font-bold ${highlight ? 'text-red-700' : 'text-gray-900'}`}>{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({ status: '', severity: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setMetrics(data.metrics)).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.severity) params.append('severity', filters.severity);
    api.get(`/complaints?${params}`)
      .then(({ data }) => setComplaints(data.complaints))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="Total" value={metrics.total} icon="📋" />
            <MetricCard label="Normal" value={metrics.bySeverity.normal} icon="🔵" />
            <MetricCard label="High" value={metrics.bySeverity.high} icon="🟠" />
            <MetricCard label="Critical" value={metrics.bySeverity.critical} icon="🔴" highlight={metrics.bySeverity.critical > 0} />
            <MetricCard label="Overdue" value={metrics.byStatus.overdue} icon="⏰" highlight={metrics.byStatus.overdue > 0} />
            <MetricCard label="Escalated to HOD" value={metrics.byStatus.escalated_to_hod} icon="⚠️" highlight={metrics.byStatus.escalated_to_hod > 0} />
            <MetricCard label="Awaiting Confirmation" value={metrics.byStatus.awaiting_student_confirmation} icon="🕐" />
            <MetricCard label="Closed" value={metrics.byStatus.closed} icon="✅" />
          </div>
        )}

        {/* Filters + Queue */}
        <div>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h2 className="text-base font-semibold text-gray-800">Complaint Queue</h2>
            <div className="flex gap-2">
              <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {STATUSES.map((s) => <option key={s} value={s}>{s ? s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'All Statuses'}</option>)}
              </select>
              <select value={filters.severity} onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value }))}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {SEVERITIES.map((s) => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Severities'}</option>)}
              </select>
            </div>
          </div>
          {loading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-10 bg-white border border-gray-200 rounded-xl text-gray-400">
              <p className="text-4xl mb-2">📭</p><p className="text-sm">No complaints match the selected filters.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {complaints.map((c) => <ComplaintCard key={c.id} complaint={c} linkPrefix="/admin" />)}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
