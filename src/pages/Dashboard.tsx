import React from 'react';
import { Shield, Trophy, Activity, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* My Teams */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold uppercase tracking-wider">My Teams</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Manage your active squads.</p>
            <Link to="/teams" className="text-sm text-primary hover:underline">View All &rarr;</Link>
          </div>

          {/* Active Tournaments */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold uppercase tracking-wider">Active Tournaments</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">You are not competing currently.</p>
            <button className="text-sm text-primary hover:underline">Find Tournaments &rarr;</button>
          </div>

          {/* Recent Matches */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold uppercase tracking-wider">Recent Matches</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">No recent matches played.</p>
          </div>

          {/* Quick Actions */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold uppercase tracking-wider">Quick Actions</h2>
            </div>
            <div className="space-y-2 flex flex-col">
              <button className="text-left text-sm text-muted-foreground hover:text-foreground">Create Team</button>
              <button className="text-left text-sm text-muted-foreground hover:text-foreground">Join Team</button>
              <button className="text-left text-sm text-muted-foreground hover:text-foreground">Edit Profile</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
