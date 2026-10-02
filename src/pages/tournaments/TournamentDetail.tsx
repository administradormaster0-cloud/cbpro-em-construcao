import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTournaments } from '@/hooks/useTournaments';

export default function TournamentDetail() {
  const { id } = useParams();
  const { tournaments, isLoading } = useTournaments();
  const tournament = (tournaments as any)?.find((t: any) => t.id === id);
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) return <div className="p-12 text-center text-primary animate-pulse font-display text-xl uppercase">Loading Data...</div>;
  if (!tournament) return <div className="p-12 text-center text-red-500 font-display">Tournament Not Found</div>;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'groups', label: 'Groups' },
    { id: 'playoffs', label: 'Playoffs' },
    { id: 'matches', label: 'Matches' },
    { id: 'entrants', label: 'Entrants' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden border-b border-border">
        {tournament.cover_url ? (
          <img src={tournament.cover_url} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-black to-surface opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 container mx-auto flex flex-col justify-end h-full">
          <div className="inline-block px-3 py-1 bg-primary/20 border border-primary text-primary text-xs font-bold uppercase tracking-widest rounded-sm mb-3 w-max">
            {tournament.status}
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tighter drop-shadow-lg">{tournament.name}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">{tournament.description || 'No description provided.'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-6 flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-white hover:bg-white/5'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-6 flex-1">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="text-xl font-display font-bold text-white uppercase mb-4">About</h2>
                <div className="text-muted-foreground whitespace-pre-wrap">{tournament.rules || 'No rules specified.'}</div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="text-xl font-display font-bold text-white uppercase mb-4">Details</h2>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Game</span>
                    <span className="text-white font-medium">{tournament.game || 'TBD'}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Format</span>
                    <span className="text-white font-medium">{tournament.format || 'TBD'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-black/40 text-xs uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-wider">#</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Team</th>
                    <th className="px-6 py-4 font-bold tracking-wider">MP</th>
                    <th className="px-6 py-4 font-bold tracking-wider">W</th>
                    <th className="px-6 py-4 font-bold tracking-wider">D</th>
                    <th className="px-6 py-4 font-bold tracking-wider">L</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-muted-foreground" colSpan={7}>Standings data not available.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'playoffs' && (
          <div className="bg-surface border border-border rounded-xl p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border border-dashed border-border flex items-center justify-center text-border">B</div>
            <p>Bracket generation coming soon.</p>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-4">
            <div className="p-6 bg-surface border border-border rounded-xl text-center text-muted-foreground">
              No matches scheduled.
            </div>
          </div>
        )}

        {activeTab === 'entrants' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="p-6 bg-surface border border-border rounded-xl text-center text-muted-foreground col-span-full">
              No entrants yet.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
