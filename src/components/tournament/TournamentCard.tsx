import React from 'react';
import { format } from 'date-fns';

interface TournamentCardProps {
  tournament: any;
  onClick?: () => void;
}

export function TournamentCard({ tournament, onClick }: TournamentCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white border border-gray-800 rounded-xl overflow-hidden hover:border-[#0A2560] transition-colors cursor-pointer"
    >
      <div className="p-4 flex items-center gap-4">
        {tournament.logo_url ? (
          <img src={tournament.logo_url} alt={tournament.name} className="w-16 h-16 rounded object-cover" />
        ) : (
          <div className="w-16 h-16 bg-gray-800 rounded flex items-center justify-center text-gray-500">
            No Logo
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{tournament.name}</h3>
          <div className="flex gap-2 mt-2 text-sm text-gray-400">
            <span>{tournament.status}</span>
            <span>•</span>
            <span>Fee: {tournament.entry_fee ? `$${tournament.entry_fee}` : 'Free'}</span>
            <span>•</span>
            <span>{tournament.entrants_count || 0} teams</span>
          </div>
        </div>
      </div>
    </div>
  );
}
