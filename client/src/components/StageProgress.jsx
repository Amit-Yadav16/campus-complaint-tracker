export default function StageProgress({ stageTemplate = [], stages = [], currentStageIndex = 0 }) {
  return (
    <div className="space-y-2">
      {stageTemplate.map((stageName, i) => {
        const completed = stages.find((s) => s.name === stageName && s.completedAt);
        const isCurrent = i === currentStageIndex && !completed;
        const isPending = i > currentStageIndex;

        return (
          <div key={i} className="flex items-start gap-3">
            {/* Circle */}
            <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
              ${completed ? 'bg-green-500 border-green-500 text-white' :
                isCurrent ? 'bg-blue-500 border-blue-500 text-white animate-pulse' :
                'bg-white border-gray-300 text-gray-400'}`}
            >
              {completed ? '✓' : i + 1}
            </div>

            {/* Label + note */}
            <div className="flex-1 pb-2">
              <p className={`text-sm font-medium
                ${completed ? 'text-green-700' :
                  isCurrent ? 'text-blue-700' :
                  'text-gray-400'}`}
              >
                {stageName}
              </p>
              {completed && (
                <div className="mt-0.5 space-y-0.5">
                  {completed.note && <p className="text-xs text-gray-500">"{completed.note}"</p>}
                  <p className="text-xs text-gray-400">
                    {new Date(completed.completedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
              {isCurrent && <p className="text-xs text-blue-500 mt-0.5">Currently in progress</p>}
            </div>

            {/* Connector line (not on last item) */}
            {i < stageTemplate.length - 1 && (
              <div className="absolute ml-3 w-0.5 h-4 bg-gray-200" style={{ marginTop: '1.5rem' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
