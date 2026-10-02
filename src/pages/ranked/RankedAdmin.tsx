import React from 'react';
import { Settings, RefreshCw, AlertTriangle } from 'lucide-react';

export default function RankedAdmin() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-white uppercase tracking-tight">ELO Management</h1>
        <p className="text-muted-foreground mt-1">Admin controls for ranking system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-display font-bold text-white uppercase flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" /> System Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">K-Factor</label>
              <input type="number" defaultValue={32} className="w-full bg-black/20 border border-border rounded-md px-3 py-2 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Base Rating</label>
              <input type="number" defaultValue={1000} className="w-full bg-black/20 border border-border rounded-md px-3 py-2 text-white" />
            </div>
            <button className="w-full cb-on-ink bg-primary font-bold py-2 rounded-md hover:bg-primary/90 transition-colors uppercase tracking-wider text-sm">
              Save Settings
            </button>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-display font-bold text-white uppercase flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" /> Danger Zone
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">These actions are irreversible. Please proceed with caution.</p>
            <button className="w-full flex justify-center items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 font-bold py-2 rounded-md hover:bg-red-500/20 transition-colors uppercase tracking-wider text-sm">
              <RefreshCw className="w-4 h-4" /> Recalculate All Ratings
            </button>
            <button className="w-full flex justify-center items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 font-bold py-2 rounded-md hover:bg-red-500/20 transition-colors uppercase tracking-wider text-sm">
              End Season & Archive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
