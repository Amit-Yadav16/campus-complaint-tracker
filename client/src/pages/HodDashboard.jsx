import { useEffect, useState } from 'react';
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

export default function HodDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [escalated, setEscalated] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  const [filters, setFilters] = useState({ status: '', severity: '' });
  const [activeTab, setActiveTab] = useState('escalated'); // 'escalated' | 'all'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/hod/dashboard'),
      api.get('/complaints'),
    ]).then(([hodRes, allRes]) => {
      setMetrics(hodRes.data.metrics);
      setEscalated(hodRes.data.escalated || []);
      setAllComplaints(allRes.data.complaints);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredAll = allComplaints.filter((c) => {
    if (filters.status && c.status !== filters.status) return false;
    if (filters.severity && c.severity !== filters.severity) return false;
    return true;
  });

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">HOD Dashboard</h1>
        <p className="text-gray-500 text-sm -mt-4">Oversight of all complaints and escalated cases</p>

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="Total" value={metrics.total} icon="📋" />
            <MetricCard label="Critical" value={metrics.bySeverity.critical} icon="🔴" highlight={metrics.bySeverity.critical > 0} />
            <MetricCard label="Escalated to HOD" value={metrics.byStatus.escalated_to_hod} icon="⚠️" highlight={metrics.byStatus.escalated_to_hod > 0} />
            <MetricCard label="Awaiting Confirmation" value={metrics.byStatus.awaiting_student_confirmation} icon="🕐" />
            <MetricCard label="Overdue" value={metrics.byStatus.overdue} icon="⏰" highlight={metrics.byStatus.overdue > 0} />
            <MetricCard label="Reopened" value={metrics.byStatus.reopened} icon="🔄" highlight={metrics.byStatus.reopened > 0} />
            <MetricCard label="In Progress" value={metrics.byStatus.in_progress} icon="🔵" />
            <MetricCard label="Closed" value={metrics.byStatus.closed} icon="✅" />
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-6">
            {[
              { key: 'escalated', label: `⚠ Escalated Cases (${escalated.length})` },
              { key: 'all',       label: `📋 All Complaints (${allComplaints.length})` },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`pb-3 text-sm font-medium border-b-2 transition ${activeTab === key ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab: Escalated */}
        {activeTab === 'escalated' && (
          <div>
            {loading ? (
              <div className="space-y-2">{[1, 2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : escalated.length === 0 ? (
              <div className="text-center py-10 bg-white border border-gray-200 rounded-xl text-gray-400">
                <p className="text-4xl mb-2">✅</p>
                <p className="text-sm font-medium">No escalated complaints</p>
                <p className="text-xs mt-1">All complaints are within SLA.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {escalated.map(c => (
                  <ComplaintCard key={c.id} complaint={c} linkPrefix="/hod" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: All Complaints */}
        {activeTab === 'all' && (
          <div>
            {/* Filters */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <select
                value={filters.status}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>
                    {s ? s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'All Statuses'}
                  </option>
                ))}
              </select>
              <select
                value={filters.severity}
                onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SEVERITIES.map(s => (
                  <option key={s} value={s}>
                    {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Severities'}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : filteredAll.length === 0 ? (
              <div className="text-center py-10 bg-white border border-gray-200 rounded-xl text-gray-400">
                <p className="text-4xl mb-2">📭</p><p className="text-sm">No complaints match filters.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAll.map(c => <ComplaintCard key={c.id} complaint={c} linkPrefix="/hod" />)}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
