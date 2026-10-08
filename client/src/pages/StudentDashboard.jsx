import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ComplaintCard from '../components/ComplaintCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function MetricCard({ label, value, color, icon }) {
  return (
    <div className={`bg-white border rounded-xl p-4 flex items-center gap-4 shadow-sm ${color}`}>
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/complaints')
      .then(({ data }) => setComplaints(data.complaints))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const count = (pred) => complaints.filter(pred).length;
  const active = complaints.filter((c) => !['closed'].includes(c.status));
  const needsConfirmation = complaints.filter((c) => c.status === 'awaiting_student_confirmation');
  const recent = complaints.slice(0, 4);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Welcome */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name} 👋</h1>
            <p className="text-gray-500 text-sm mt-0.5">{user?.collegeEmail}</p>
          </div>
          <Link
            to="/student/submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow transition"
          >
            + Submit Complaint
          </Link>
        </div>

        {/* Metrics */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="Total Complaints" value={complaints.length} icon="📋" color="border-gray-200" />
            <MetricCard label="Active" value={active.length} icon="🔄" color="border-blue-100" />
            <MetricCard label="Awaiting My Confirmation" value={needsConfirmation.length} icon="🔔" color="border-purple-100" />
            <MetricCard label="Closed" value={count((c) => c.status === 'closed')} icon="✅" color="border-green-100" />
          </div>
        )}

        {/* Needs your attention */}
        {needsConfirmation.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <h2 className="text-sm font-bold text-purple-800 mb-3">🔔 Needs Your Attention — Please Confirm Resolution</h2>
            <div className="space-y-2">
              {needsConfirmation.map((c) => <ComplaintCard key={c.id} complaint={c} linkPrefix="/student" />)}
            </div>
          </div>
        )}

        {/* Recent complaints */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800">Recent Complaints</h2>
            <Link to="/student/complaints" className="text-sm text-blue-600 hover:text-blue-700">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : recent.length === 0 ? (
            <div className="text-center py-10 bg-white border border-gray-200 rounded-xl text-gray-400">
              <p className="text-4xl mb-2">📭</p>
              <p className="text-sm">No complaints yet.</p>
              <Link to="/student/submit" className="text-blue-600 text-sm hover:underline mt-1 inline-block">Submit your first complaint</Link>
            </div>
          ) : (
            <div className="space-y-2">{recent.map((c) => <ComplaintCard key={c.id} complaint={c} linkPrefix="/student" />)}</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
