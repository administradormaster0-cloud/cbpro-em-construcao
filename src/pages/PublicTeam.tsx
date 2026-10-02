import React from 'react';
import { Swords, Star, Gamepad2, Crown, Globe } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function PublicTeam() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Team Hero */}
      <div className="relative border-b border-border bg-secondary/20 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(hsl(var(--primary)/0.4) 1px, transparent 1px)', backgroundSize: '48px 48px' }} 
        />
        <div className="teams-hero__stripe"></div>
        <div className="relative p-4 sm:p-6 lg:p-7 max-w-7xl mx-auto">
          <div className="teams-hero__topline">
            <span><strong>CLUB LOBBY</strong> <span className="mx-1.5 opacity-40">/</span> PUBLIC PROFILE</span>
          </div>

          <div className="teams-hero__identity flex items-start gap-4 sm:gap-6 mt-4">
            <div className="teams-hero__crest h-20 w-20 sm:h-32 sm:w-32 rounded-2xl bg-secondary/80 border border-primary/30 flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_30px_hsl(var(--primary)/.12)]">
              <Swords className="h-10 w-10 text-primary/30" />
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] bg-primary/15 text-primary border-primary/30 font-bold uppercase tracking-wider">
                  <Star className="h-2.5 w-2.5 mr-1" /> PRO TIER
                </span>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-bold variant-outline">
                  EST. 2024
                </span>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] text-muted-foreground variant-outline">
                  <Gamepad2 className="h-2.5 w-2.5 mr-1" /> EA FC 24
                </span>
              </div>
              
              <h2 className="font-display text-2xl sm:text-4xl font-black tracking-tight uppercase italic break-words">
                FC LEGENDS
              </h2>
              
              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className="flex items-center gap-1.5 text-primary font-bold">
                  <Crown className="h-4 w-4" /> 2 <span className="text-[10px] uppercase tracking-wider font-medium">TITLES</span>
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Globe className="h-3.5 w-3.5" /> Global
                </span>
              </div>
              
              <p className="text-[11px] text-muted-foreground mt-2 uppercase tracking-wider">
                Tag: <span className="text-foreground font-bold">[FCL]</span>
              </p>
            </div>
            
            <div className="hidden sm:block">
              <button className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-bold text-sm uppercase tracking-wider">
                Apply to Join
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <h3 className="font-display text-2xl font-bold uppercase tracking-tight mb-4">Club Stats</h3>
        <p className="text-muted-foreground">Public stats go here.</p>
      </div>
    </div>
  );
}
