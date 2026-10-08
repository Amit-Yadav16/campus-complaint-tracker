import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';

const CATEGORIES = [
  { value: 'campus_maintenance', label: 'Campus Maintenance',  severity: 'Normal',   icon: '🔧' },
  { value: 'hostel',             label: 'Hostel',              severity: 'Normal',   icon: '🏠' },
  { value: 'academic',           label: 'Academic',            severity: 'High',     icon: '📚' },
  { value: 'examination',        label: 'Examination',         severity: 'High',     icon: '📝' },
  { value: 'ragging',            label: 'Ragging',             severity: 'Critical', icon: '🚨' },
  { value: 'harassment',         label: 'Harassment',          severity: 'Critical', icon: '🚨' },
  { value: 'threat_assault',     label: 'Threat / Assault',    severity: 'Critical', icon: '🚨' },
  { value: 'administration',     label: 'Administration',      severity: 'Normal',   icon: '🗂' },
  { value: 'other',              label: 'Other',               severity: 'Normal',   icon: '📌' },
];

const SEV_COLORS = { Normal: 'text-blue-600', High: 'text-orange-600', Critical: 'text-red-600' };

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ category: '', description: '', location: '', mobile: '', evidenceNote: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedCat = CATEGORIES.find((c) => c.value === form.category);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/complaints', form);
      navigate(`/student/complaints/${data.complaint.id}`, { state: { justCreated: true } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Submit a Complaint</h1>
          <p className="text-gray-500 text-sm mt-1">Your complaint will be assigned a unique ID and processed based on category and severity.</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: cat.value }))}
                  className={`text-left p-3 rounded-lg border text-sm transition
                    ${form.category === cat.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'}`}
                >
                  <div className="text-lg mb-0.5">{cat.icon}</div>
                  <div className="font-medium text-xs">{cat.label}</div>
                  <div className={`text-[10px] font-semibold ${SEV_COLORS[cat.severity]}`}>{cat.severity}</div>
                </button>
              ))}
            </div>
            {selectedCat?.severity === 'Critical' && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                ⚠ <strong>Critical complaint</strong> — This will follow a high-priority workflow and may be eligible for external reporting if unresolved.
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe the issue clearly and in detail..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location / Area *</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="e.g. Hostel Block A, Room 204"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact Mobile *</label>
            <input
              type="tel"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              required
              pattern="[6-9][0-9]{9}"
              placeholder="10-digit mobile number"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Evidence note */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Supporting Details <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              name="evidenceNote"
              value={form.evidenceNote}
              onChange={handleChange}
              rows={2}
              placeholder="Any additional supporting information, witness names, etc."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
            📌 After submission, the system will auto-assign a severity and SLA deadline based on the selected category. You will be notified as the complaint progresses.
          </div>

          <button
            type="submit"
            disabled={loading || !form.category}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg text-sm transition flex items-center justify-center gap-2"
          >
            {loading ? 'Submitting...' : '📨 Submit Complaint'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
