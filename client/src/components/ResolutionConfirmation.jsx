import { useState } from 'react';
import api from '../services/api';

export default function ResolutionConfirmation({ complaint, onUpdate }) {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  if (complaint.status !== 'awaiting_student_confirmation') return null;

  const handleResponse = async (response) => {
    setLoading(response);
    setError('');
    try {
      const { data } = await api.post(`/complaints/${complaint.id}/confirm`, { response });
      onUpdate(data.complaint);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit response');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-5">
      <h3 className="text-base font-bold text-purple-800 mb-1 flex items-center gap-2">
        <span>🔔</span> Resolution Proposed — Your Confirmation Required
      </h3>

      {complaint.resolution && (
        <div className="bg-white border border-purple-100 rounded-lg p-4 mb-4 mt-3">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Proposed Resolution</p>
          <p className="text-sm text-gray-700">{complaint.resolution.description}</p>
          <p className="text-xs text-gray-400 mt-2">
            Proposed on {new Date(complaint.resolution.proposedAt).toLocaleString('en-IN')}
          </p>
        </div>
      )}

      <p className="text-sm text-purple-700 mb-4">
        Has the issue been <strong>actually resolved</strong>? Your honest response matters — the complaint cannot be closed without your confirmation.
      </p>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => handleResponse('yes')}
          disabled={!!loading}
          className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition"
        >
          {loading === 'yes' ? '...' : '✅ Yes, Issue is Resolved'}
        </button>
        <button
          onClick={() => handleResponse('no')}
          disabled={!!loading}
          className="flex-1 min-w-[120px] bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition"
        >
          {loading === 'no' ? '...' : '❌ No, Issue Still Exists'}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        Selecting NO will reopen this complaint and return it to the workflow.
      </p>
    </div>
  );
}
