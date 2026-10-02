import React from 'react';

export function BracketView({ rounds }: { rounds: any[] }) {
  return (
    <div className="flex gap-8 overflow-x-auto p-4 min-h-[400px] bg-white rounded-xl border border-gray-800">
      {rounds.map((round, rIndex) => (
        <div key={rIndex} className="flex flex-col justify-around min-w-[200px]">
          <h4 className="text-center text-gray-400 font-bold mb-4">{round.name}</h4>
          {round.matches.map((match: any, mIndex: number) => (
            <div key={mIndex} className="bg-gray-900 border border-gray-700 rounded-lg p-3 my-2 shadow-lg">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-800">
                <span className="text-white text-sm">{match.teamA?.name || 'TBD'}</span>
                <span className="font-bold text-[#0A2560]">{match.scoreA ?? '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">{match.teamB?.name || 'TBD'}</span>
                <span className="font-bold text-[#0A2560]">{match.scoreB ?? '-'}</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
