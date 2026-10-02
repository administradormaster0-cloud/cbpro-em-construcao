import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFederations, useEloSeasons } from '@/hooks/useData';
import { Shield, MapPin, Link as LinkIcon, Calendar } from 'lucide-react';

export default function OrgDetail() {
  const { id } = useParams();
  const { data: orgs, isLoading } = useFederations() as any;
  const org = (orgs as any)?.find((o: any) => o.id === id || o.slug === id);
  const [activeTab, setActiveTab] = useState('tournaments');

  if (isLoading) return <div className="p-12 text-center text-primary animate-pulse font-display text-xl uppercase">Loading Federation...</div>;
  if (!org) return <div className="p-12 text-center text-red-500 font-display">Federation Not Found</div>;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="relative h-64 md:h-80 w-full overflow-hidden border-b border-border">
        {org.cover_url ? (
          <img src={org.cover_url} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-black to-surface opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 container mx-auto flex items-end gap-6 h-full pb-8">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-black border-2 border-border overflow-hidden shadow-2xl flex-shrink-0 flex items-center justify-center">
            {org.logo_url ? (
              <img src={org.logo_url} alt={org.name} className="w-full h-full object-contain p-2" />
            ) : (
              <Shield className="w-16 h-16 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col pb-2">
            <h1 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tighter drop-shadow-lg">{org.name}</h1>
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              {org.country && <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-primary" /> {org.country}</span>}
              {org.website && <a href={org.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors"><LinkIcon className="w-4 h-4 text-primary" /> Website</a>}
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-primary" /> Joined {new Date(org.created_at).getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-6 flex gap-1 overflow-x-auto no-scrollbar">
          {['tournaments', 'teams', 'about'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-white hover:bg-white/5'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto p-6 flex-1">
        {activeTab === 'tournaments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
              No tournaments to display.
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
              No teams affiliated yet.
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-3xl space-y-8">
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-xl font-display font-bold text-white uppercase mb-4">About Federation</h2>
              <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {org.description || 'No description provided.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
