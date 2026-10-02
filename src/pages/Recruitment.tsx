import React from 'react';
import { useFederations } from '@/hooks/useData';
import { UserPlus, MessageSquare, MapPin } from 'lucide-react';

export default function Recruitment() {
  const { data: ads, isLoading } = useFederations();

  if (isLoading) return <div className="p-12 text-center text-primary animate-pulse font-display text-xl uppercase">Loading Feed...</div>;

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white uppercase tracking-tight">Recruitment</h1>
          <p className="text-muted-foreground mt-1">Find teams or players for your roster</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2 cb-on-ink bg-primary font-bold uppercase tracking-wider text-sm rounded-md hover:bg-primary/90 transition-colors">
          <UserPlus className="w-4 h-4" /> Create Ad
        </button>
      </div>

      <div className="flex gap-2 border-b border-border pb-px">
        {['ALL', 'LFA (Looking For Agency)', 'LFT (Looking For Team)', 'LFP (Looking For Player)'].map(type => (
          <button
            key={type}
            className={`px-4 py-2 text-sm font-bold tracking-wider uppercase whitespace-nowrap border-b-2 transition-colors ${type === 'ALL' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-white'}`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {/* Mock recruitment cards */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-6 hover:border-primary/50 transition-colors flex gap-6">
            <div className="w-16 h-16 rounded-full bg-black/50 border border-border flex-shrink-0 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider rounded">
                      {i % 2 === 0 ? 'LFT' : 'LFP'}
                    </span>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase">Player/Team Name {i}</h3>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-border text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-white/5 transition-colors">
                  <MessageSquare className="w-4 h-4 text-primary" /> Contact
                </button>
              </div>
              <p className="text-muted-foreground text-sm">
                Looking for a competitive team for the upcoming season. Main roles: Mid/Attack. Available to train 4 days a week.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" /> Brazil
                </span>
                <span className="text-xs text-muted-foreground">
                  <strong className="text-white">Role:</strong> Midfielder
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
