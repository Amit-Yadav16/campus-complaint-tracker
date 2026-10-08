import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import SlaIndicator from '../components/SlaIndicator';
import StageProgress from '../components/StageProgress';
import ComplaintTimeline from '../components/ComplaintTimeline';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CAT_LABELS = {
  campus_maintenance: 'Campus Maintenance', hostel: 'Hostel', academic: 'Academic',
  examination: 'Examination', ragging: 'Ragging', harassment: 'Harassment',
  threat_assault: 'Threat / Assault', administration: 'Administration', other: 'Other',
};

export default function AdminComplaintDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stage action state
  const [stageNote, setStageNote] = useState('');
  const [stageLoading, setStageLoading] = useState(false);
  const [stageError, setStageError] = useState('');

  // Resolution state
  const [resDesc, setResDesc] = useState('');
  const [resLoading, setResLoading] = useState(false);
  const [resError, setResError] = useState('');
  const [showResForm, setShowResForm] = useState(false);

  const backPath = user?.role === 'hod' ? '/hod/dashboard' : '/admin/dashboard';

  useEffect(() => {
    api.get(`/complaints/${id}`)
      .then(({ data }) => setComplaint(data.complaint))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load complaint'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCompleteStage = async () => {
    setStageLoading(true);
    setStageError('');
    try {
      const { data } = await api.patch(`/complaints/${id}/stage`, { note: stageNote });
      setComplaint(data.complaint);
      setStageNote('');
    } catch (err) {
      setStageError(err.response?.data?.error || 'Failed to advance stage');
    } finally {
      setStageLoading(false);
    }
  };

  const handleSubmitResolution = async () => {
    if (!resDesc.trim()) { setResError('Resolution description is required'); return; }
    setResLoading(true);
    setResError('');
    try {
      const { data } = await api.post(`/complaints/${id}/resolution`, { description: resDesc });
      setComplaint(data.complaint);
      setShowResForm(false);
      setResDesc('');
    } catch (err) {
      setResError(err.response?.data?.error || 'Failed to submit resolution');
    } finally {
      setResLoading(false);
    }
  };

  if (loading) return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <p className="text-red-600">{error}</p>
        <Link to={backPath} className="text-blue-600 text-sm mt-2 inline-block">← Go back</Link>
      </div>
    </Layout>
  );

  if (!complaint) return null;

  // Determine what actions are available
  const canAdvanceStage = !['closed', 'awaiting_student_confirmation'].includes(complaint.status);
  const stageTemplate = complaint.stageTemplate || [];
  const lastActionableIdx = stageTemplate.length - 2; // second-to-last (before "Resolution Proposed")
  const atLastActionableStage = complaint.currentStageIndex >= lastActionableIdx;
  const canProposeResolution = canAdvanceStage && !['awaiting_student_confirmation', 'closed'].includes(complaint.status);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Back + header */}
        <div>
          <Link to={backPath} className="text-sm text-blue-600 hover:text-blue-700">← Back to Dashboard</Link>
          <div className="flex items-start justify-between gap-3 mt-3 flex-wrap">
            <div>
              <p className="text-xs font-mono text-gray-400">{complaint.id}</p>
              <h1 className="text-xl font-bold text-gray-900 mt-0.5">
                {CAT_LABELS[complaint.category] || complaint.category}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">📍 {complaint.location}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={complaint.status} size="md" />
              <SeverityBadge severity={complaint.severity} />
            </div>
          </div>
        </div>

        {/* Escalation banner */}
        {complaint.status === 'escalated_to_hod' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-bold text-red-700">⚠ Escalated to HOD</p>
            <p className="text-xs text-red-600 mt-1">Reason: {complaint.escalation?.reason}</p>
            <p className="text-xs text-red-500 mt-0.5">
              At: {new Date(complaint.escalation?.escalatedAt).toLocaleString('en-IN')}
            </p>
          </div>
        )}

        {/* Awaiting confirmation banner */}
        {complaint.status === 'awaiting_student_confirmation' && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <p className="text-sm font-bold text-purple-800">🕐 Awaiting Student Confirmation</p>
            <p className="text-xs text-purple-600 mt-1">
              Resolution proposed on {new Date(complaint.resolution?.proposedAt).toLocaleString('en-IN')}.
              The complaint will be CLOSED only after the student confirms YES.
            </p>
          </div>
        )}

        {/* Closed / Reopened */}
        {complaint.status === 'closed' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
            ✅ <strong>Closed</strong> — Student confirmed the issue is resolved on {new Date(complaint.resolution?.respondedAt).toLocaleString('en-IN')}.
          </div>
        )}
        {complaint.status === 'reopened' && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-700">
            🔄 <strong>Reopened</strong> — Student reported the issue was NOT resolved. Please restart the workflow.
          </div>
        )}

        {/* Complaint Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Complaint Details</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Description</p>
              <p className="text-gray-700">{complaint.description}</p>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-400">Mobile</p>
                <p className="text-gray-700">{complaint.mobile}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Submitted</p>
                <p className="text-gray-700">{new Date(complaint.createdAt).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
          {complaint.evidenceNote && (
            <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600">
              <span className="font-medium">Additional Details:</span> {complaint.evidenceNote}
            </div>
          )}
        </div>

        {/* SLA */}
        {!['closed'].includes(complaint.status) && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">SLA Status</h2>
            <SlaIndicator complaint={complaint} />
          </div>
        )}

        {/* Stage Progress + Action */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Stage Progress</h2>
          <StageProgress
            stageTemplate={complaint.stageTemplate}
            stages={complaint.stages}
            currentStageIndex={complaint.currentStageIndex}
          />

          {/* Stage action panel */}
          {canAdvanceStage && !atLastActionableStage && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Complete current stage: <span className="text-blue-600">"{stageTemplate[complaint.currentStageIndex]}"</span>
              </p>
              <textarea
                value={stageNote}
                onChange={(e) => setStageNote(e.target.value)}
                rows={2}
                placeholder="Add a note about this stage (optional)..."
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-2"
              />
              {stageError && <p className="text-xs text-red-600 mb-2">{stageError}</p>}
              <button
                onClick={handleCompleteStage}
                disabled={stageLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
              >
                {stageLoading ? 'Advancing...' : `✅ Complete Stage → ${stageTemplate[complaint.currentStageIndex + 1] || ''}`}
              </button>
            </div>
          )}

          {/* At last actionable stage — offer resolution */}
          {canProposeResolution && atLastActionableStage && !showResForm && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-2">
                All stages complete. You can now propose a resolution.
              </p>
              <button
                onClick={() => setShowResForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
              >
                💡 Propose Resolution
              </button>
            </div>
          )}
        </div>

        {/* Resolution Proposal Form */}
        {showResForm && canProposeResolution && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <h2 className="text-sm font-bold text-green-800 mb-1">Propose Resolution</h2>
            <p className="text-xs text-green-700 mb-3">
              ⚠ <strong>You cannot directly close this complaint.</strong> After submitting, the student will be asked to confirm YES or NO. Only their YES closes the complaint.
            </p>
            <textarea
              value={resDesc}
              onChange={(e) => setResDesc(e.target.value)}
              rows={4}
              placeholder="Describe the resolution taken in detail..."
              className="w-full text-sm px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none mb-3"
            />
            {resError && <p className="text-xs text-red-600 mb-2">{resError}</p>}
            <div className="flex gap-3">
              <button
                onClick={handleSubmitResolution}
                disabled={resLoading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
              >
                {resLoading ? 'Submitting...' : '📨 Submit Resolution Proposal'}
              </button>
              <button
                onClick={() => { setShowResForm(false); setResError(''); }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Existing resolution (if proposed/closed) */}
        {complaint.resolution && complaint.status !== 'awaiting_student_confirmation' && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Resolution Details</h2>
            <p className="text-sm text-gray-700">{complaint.resolution.description}</p>
            {complaint.resolution.studentResponse && (
              <div className={`mt-3 text-xs font-medium px-3 py-2 rounded-lg ${complaint.resolution.studentResponse === 'yes' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                Student response: <strong>{complaint.resolution.studentResponse === 'yes' ? '✅ YES — Resolved' : '❌ NO — Not resolved'}</strong>
                {' '}on {new Date(complaint.resolution.respondedAt).toLocaleString('en-IN')}
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Activity Timeline</h2>
          <ComplaintTimeline timeline={complaint.timeline} />
        </div>

        <div className="pb-4">
          <Link to={backPath} className="text-sm text-blue-600 hover:text-blue-700">← Back to Dashboard</Link>
        </div>
      </div>
    </Layout>
  );
}
