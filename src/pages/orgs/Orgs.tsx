import React from 'react';
import { useFederations, useEloSeasons } from '@/hooks/useData';
import { Link } from 'react-router-dom';
import { Shield, Users, Trophy } from 'lucide-react';

export default function Orgs() {
  const { data: orgs, isLoading } = useFederations();

  if (isLoading) return <div className="p-12 text-center text-primary animate-pulse font-display text-xl uppercase">Loading Federations...</div>;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white uppercase tracking-tight">Federations</h1>
          <p className="text-muted-foreground mt-1">Official organizers and leagues</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orgs?.map((org: any) => (
          <Link key={org.id} to={`/federations/${org.slug || org.id}`} className="group flex flex-col bg-surface border border-border rounded-xl overflow-hidden hover:border-primary transition-all duration-300">
            <div className="h-32 bg-black/50 relative overflow-hidden">
              {org.cover_url && <img src={org.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" />}
              <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
            </div>
            <div className="px-6 relative -mt-12 mb-4">
              <div className="w-24 h-24 rounded-xl bg-black border-2 border-surface overflow-hidden shadow-xl flex items-center justify-center">
                {org.logo_url ? (
                  <img src={org.logo_url} alt={org.name} className="w-full h-full object-contain p-2" />
                ) : (
                  <Shield className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
            </div>
            <div className="px-6 pb-6 flex-1 flex flex-col">
              <h3 className="text-xl font-display font-bold text-white mb-1 group-hover:text-primary transition-colors">{org.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{org.description || 'Official Federation'}</p>
              
              <div className="mt-auto grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Members</span>
                  <span className="text-lg font-mono text-white flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> {org.member_count || 0}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Tourneys</span>
                  <span className="text-lg font-mono text-white flex items-center gap-2"><Trophy className="w-4 h-4 text-primary" /> {org.tournament_count || 0}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {(!orgs || orgs.length === 0) && (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
            No federations found.
          </div>
        )}
      </div>
    </div>
  );
}
