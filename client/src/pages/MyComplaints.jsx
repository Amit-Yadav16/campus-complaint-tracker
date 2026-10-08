import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ComplaintCard from '../components/ComplaintCard';
import api from '../services/api';

const STATUSES = ['', 'submitted', 'in_progress', 'escalated_to_hod', 'awaiting_student_confirmation', 'reopened', 'closed'];
const SEVERITIES = ['', 'normal', 'high', 'critical'];

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', severity: '' });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.severity) params.append('severity', filters.severity);
      const { data } = await api.get(`/complaints?${params}`);
      setComplaints(data.complaints);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, [filters]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
          <div className="flex gap-2 flex-wrap">
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s ? s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'All Statuses'}</option>)}
            </select>
            <select
              value={filters.severity}
              onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value }))}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SEVERITIES.map((s) => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Severities'}</option>)}
            </select>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">📋</div>
            <p className="font-medium">No complaints found</p>
            <p className="text-sm mt-1">Try changing the filters or submit a new complaint.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => <ComplaintCard key={c.id} complaint={c} linkPrefix="/student" />)}
          </div>
        )}
      </div>
    </Layout>
  );
}
