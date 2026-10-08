function formatTime(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const EVENT_ICONS = {
  'Complaint submitted':        '📋',
  'Stage completed':            '✅',
  'Stage started':              '▶️',
  'Escalated to HOD':           '⚠️',
  'Resolution proposed':        '💡',
  'Awaiting student confirmation': '🕐',
  'Student confirmed':          '✅',
  'Student rejected':           '❌',
};

function getIcon(event) {
  for (const [key, icon] of Object.entries(EVENT_ICONS)) {
    if (event.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return '📌';
}

export default function ComplaintTimeline({ timeline = [] }) {
  if (!timeline.length) return <p className="text-gray-400 text-sm">No timeline events yet.</p>;

  return (
    <ol className="relative border-l border-gray-200 space-y-6 ml-3">
      {timeline.map((entry, i) => (
        <li key={i} className="ml-6">
          <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-white border border-gray-200 rounded-full text-sm">
            {getIcon(entry.event)}
          </span>
          <div className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
            <p className="text-sm font-semibold text-gray-800">{entry.event}</p>
            {entry.note && <p className="text-sm text-gray-600 mt-0.5">{entry.note}</p>}
            <p className="text-xs text-gray-400 mt-1">{formatTime(entry.timestamp)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
