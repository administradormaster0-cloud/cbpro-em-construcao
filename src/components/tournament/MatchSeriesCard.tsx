import React from 'react';

export function MatchSeriesCard({ series }: { series: any }) {
  return (
    <div className="bg-white border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-4 flex-1 justify-end">
        <span className="text-white font-bold">{series.teamA?.name || 'TBA'}</span>
        {series.teamA?.logo ? (
          <img src={series.teamA.logo} alt="" className="w-10 h-10 rounded-full bg-gray-800" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-800" />
        )}
      </div>
      
      <div className="flex flex-col items-center justify-center px-6">
        <span className="text-xs text-gray-400 mb-1">{series.status || 'Scheduled'}</span>
        <div className="flex items-center gap-3 bg-gray-900 px-4 py-2 rounded-lg border border-gray-800">
          <span className="text-xl font-bold text-white">{series.scoreA ?? '-'}</span>
          <span className="text-gray-500 text-sm">vs</span>
          <span className="text-xl font-bold text-white">{series.scoreB ?? '-'}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-1 justify-start">
        {series.teamB?.logo ? (
          <img src={series.teamB.logo} alt="" className="w-10 h-10 rounded-full bg-gray-800" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-800" />
        )}
        <span className="text-white font-bold">{series.teamB?.name || 'TBA'}</span>
      </div>
    </div>
  );
}
