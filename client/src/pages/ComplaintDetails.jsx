import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import SlaIndicator from '../components/SlaIndicator';
import StageProgress from '../components/StageProgress';
import ComplaintTimeline from '../components/ComplaintTimeline';
import ResolutionConfirmation from '../components/ResolutionConfirmation';
import api from '../services/api';

const CAT_LABELS = {
  campus_maintenance: 'Campus Maintenance', hostel: 'Hostel', academic: 'Academic',
  examination: 'Examination', ragging: 'Ragging', harassment: 'Harassment',
  threat_assault: 'Threat / Assault', administration: 'Administration', other: 'Other',
};

export default function ComplaintDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/complaints/${id}`)
      .then(({ data }) => setComplaint(data.complaint))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load complaint'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><div className="max-w-3xl mx-auto"><div className="h-64 bg-gray-100 rounded-xl animate-pulse" /></div></Layout>;
  if (error) return <Layout><div className="max-w-3xl mx-auto"><p className="text-red-600">{error}</p></div></Layout>;
  if (!complaint) return null;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Just-created banner */}
        {location.state?.justCreated && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm flex gap-2">
            ✅ Complaint submitted successfully! Track progress below.
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs text-gray-400 font-mono mb-1">{complaint.id}</p>
              <h1 className="text-lg font-bold text-gray-900">
                {CAT_LABELS[complaint.category] || complaint.category}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">📍 {complaint.location}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={complaint.status} size="md" />
              <SeverityBadge severity={complaint.severity} />
            </div>
          </div>

          <p className="mt-3 text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-3">{complaint.description}</p>

          {complaint.evidenceNote && (
            <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded px-3 py-2">
              <span className="font-medium">Additional details:</span> {complaint.evidenceNote}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400 border-t border-gray-100 pt-3">
            <span>📅 Submitted: {new Date(complaint.createdAt).toLocaleString('en-IN')}</span>
            <span>📞 {complaint.mobile}</span>
          </div>
        </div>

        {/* Resolution Confirmation (student YES/NO) */}
        <ResolutionConfirmation complaint={complaint} onUpdate={setComplaint} />

        {/* Closed / Reopened banner */}
        {complaint.status === 'closed' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
            ✅ This complaint has been <strong>closed</strong> after your confirmation. Thank you!
          </div>
        )}
        {complaint.status === 'reopened' && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-700">
            🔄 This complaint has been <strong>reopened</strong> and returned to the workflow.
          </div>
        )}

        {/* SLA Indicator */}
        {!['closed'].includes(complaint.status) && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">SLA Status</h2>
            <SlaIndicator complaint={complaint} />
          </div>
        )}

        {/* Escalation notice */}
        {complaint.escalation && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h2 className="text-sm font-bold text-red-700 mb-1">⚠ Escalated to HOD</h2>
            <p className="text-xs text-red-600">Reason: {complaint.escalation.reason}</p>
            <p className="text-xs text-red-500 mt-1">
              Escalated at: {new Date(complaint.escalation.escalatedAt).toLocaleString('en-IN')}
            </p>
            {complaint.escalation.hodActionAt && (
              <p className="text-xs text-red-600 mt-1">HOD action note: {complaint.escalation.hodNote}</p>
            )}
          </div>
        )}

        {/* Stage progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Stage Progress</h2>
          <StageProgress
            stageTemplate={complaint.stageTemplate}
            stages={complaint.stages}
            currentStageIndex={complaint.currentStageIndex}
          />
        </div>

        {/* Resolution details if proposed */}
        {complaint.resolution && complaint.status === 'closed' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-green-800 mb-2">Resolution</h2>
            <p className="text-sm text-green-700">{complaint.resolution.description}</p>
            {complaint.resolution.studentResponse === 'yes' && (
              <p className="text-xs text-green-600 mt-2">✅ Confirmed by student on {new Date(complaint.resolution.respondedAt).toLocaleString('en-IN')}</p>
            )}
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Activity Timeline</h2>
          <ComplaintTimeline timeline={complaint.timeline} />
        </div>

        {/* External report button */}
        {complaint.isExternalReportEligible && ['escalated_to_hod', 'reopened'].includes(complaint.status) && (
          <ExternalReportSection complaint={complaint} />
        )}

        <div className="pb-4">
          <Link to="/student/complaints" className="text-sm text-blue-600 hover:text-blue-700">← Back to My Complaints</Link>
        </div>
      </div>
    </Layout>
  );
}

function ExternalReportSection({ complaint }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleGenerate = async () => {
    if (!confirmed) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/reports/external', { complaintId: complaint.id });
      setReport(data.report);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
      <h2 className="text-sm font-bold text-amber-800 mb-2">🚨 External Reporting Option</h2>
      <p className="text-xs text-amber-700 mb-3">
        This complaint is eligible for external/police reporting. This will generate a <strong>structured report</strong> for you to personally submit to the relevant authority. The system does NOT automatically file any complaint on your behalf.
      </p>

      {!report ? (
        <>
          <label className="flex items-start gap-2 cursor-pointer mb-3">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5" />
            <span className="text-xs text-amber-800">I understand this generates a report only. I will personally submit it to the appropriate authority after reviewing it.</span>
          </label>
          {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
          <button
            onClick={handleGenerate}
            disabled={!confirmed || loading}
            className="text-sm bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            {loading ? 'Generating...' : 'Generate External Report'}
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <div className="bg-white border border-amber-100 rounded-lg p-4 text-xs text-gray-700 space-y-2">
            <p className="font-bold text-red-700">{report.disclaimer}</p>
            <p><strong>Report ID:</strong> {report.reportId}</p>
            <p><strong>Complaint:</strong> {report.complaintId}</p>
            <p><strong>Category:</strong> {report.category}</p>
            <p><strong>Description:</strong> {report.description}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-800 mb-2">Official Reporting Channels:</p>
            {report.officialRoutes.map((route, i) => (
              <div key={i} className="text-xs text-gray-700 bg-white border border-amber-100 rounded px-3 py-2 mb-1.5">
                <span className="font-medium">{route.name}</span> — {route.contact}
                {route.url && <> | <a href={route.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">{route.url}</a></>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
