import React from 'react';

export function StageManager({ stages }: { stages: any[] }) {
  return (
    <div className="space-y-4">
      {stages.map((stage, i) => (
        <div key={i} className="bg-white border border-gray-800 rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-white">{stage.stage_type}</h4>
            <span className="px-2 py-1 bg-gray-800 text-xs rounded text-gray-300">
              Order: {stage.stage_order}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            <p>Result Mode: {stage.result_mode}</p>
            {stage.standings_mode && <p>Standings: {stage.standings_mode}</p>}
          </div>
        </div>
      ))}
      <button className="w-full py-3 border border-dashed border-gray-700 text-gray-400 rounded-xl hover:text-white hover:border-gray-500 transition-colors">
        + Add Stage
      </button>
    </div>
  );
}
