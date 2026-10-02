import React from 'react';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Teams() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-4xl font-black uppercase tracking-tight">Teams Directory</h1>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold text-sm uppercase tracking-wider">
            Create Team
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Example Team Card */}
          <Link to="/teams/1" className="bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors group">
            <div className="h-32 bg-secondary/50 relative flex items-center justify-center border-b border-border">
              <Shield className="h-16 w-16 text-primary/30 group-hover:text-primary/50 transition-colors" />
            </div>
            <div className="p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">PRO LEAGUE</div>
              <h3 className="font-display text-xl font-bold uppercase tracking-tight">FC Example</h3>
              <p className="text-xs text-muted-foreground mt-2">12 Players • Global</p>
            </div>
          </Link>
          {/* End Example */}
        </div>
      </div>
    </div>
  );
}
