import React from 'react';

export function TournamentRegistration({ tournamentId }: { tournamentId: string }) {
  return (
    <div className="bg-white border border-gray-800 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Register for Tournament</h3>
      <p className="text-gray-400 mb-6">Select a team to register.</p>
      
      <div className="space-y-4 mb-6">
        <select className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white">
          <option>Select Team...</option>
        </select>
      </div>

      <button className="w-full py-3 cb-on-ink bg-[#0A2560] font-bold rounded-lg hover:bg-[#0B4DA2] transition-colors">
        Confirm Registration
      </button>
    </div>
  );
}
