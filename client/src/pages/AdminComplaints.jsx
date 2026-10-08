import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ComplaintCard from '../components/ComplaintCard';
import api from '../services/api';

const STATUSES = ['', 'submitted', 'in_progress', 'escalated_to_hod', 'awaiting_student_confirmation', 'reopened', 'closed'];
const SEVERITIES = ['', 'normal', 'high', 'critical'];
const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'campus_maintenance', label: 'Campus Maintenance' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'academic', label: 'Academic' },
  { value: 'examination', label: 'Examination' },
  { value: 'ragging', label: 'Ragging' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'threat_assault', label: 'Threat / Assault' },
  { value: 'administration', label: 'Administration' },
  { value: 'other', label: 'Other' },
];

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', severity: '', category: '' });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.status)   params.append('status', filters.status);
    if (filters.severity) params.append('severity', filters.severity);
    if (filters.category) params.append('category', filters.category);
    api.get(`/complaints?${params}`)
      .then(({ data }) => setComplaints(data.complaints))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  const resetFilters = () => setFilters({ status: '', severity: '', category: '' });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Complaint Queue</h1>
          <span className="text-sm text-gray-500">{complaints.length} complaint{complaints.length !== 1 ? 's' : ''} found</span>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 items-end shadow-sm">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
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
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Severity</label>
            <select
              value={filters.severity}
              onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SEVERITIES.map(s => (
                <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Severities'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          {(filters.status || filters.severity || filters.category) && (
            <button onClick={resetFilters} className="text-xs text-red-500 hover:text-red-700 underline">
              Clear filters
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-xl text-gray-400">
            <div className="text-5xl mb-3">📭</div>
            <p className="font-medium">No complaints found</p>
            <p className="text-sm mt-1">Try adjusting the filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map(c => <ComplaintCard key={c.id} complaint={c} linkPrefix="/admin" />)}
          </div>
        )}
      </div>
    </Layout>
  );
}
