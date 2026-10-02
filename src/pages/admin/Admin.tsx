import React, { useState } from 'react';
import { ShieldAlert, Users, Trophy, Flag, Settings, Ban, Shield } from 'lucide-react';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'federations', label: 'Federations', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'features', label: 'Feature Flags', icon: Flag },
    { id: 'bans', label: 'Bans', icon: Ban }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8 flex flex-col h-[calc(100vh-5rem)]">
      <div>
        <h1 className="text-3xl font-display font-bold text-white uppercase tracking-tight flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-500" /> Admin Control Panel
        </h1>
        <p className="text-muted-foreground mt-1">Superuser access only</p>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto no-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-white hover:bg-white/5'}`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 bg-surface border border-border rounded-xl p-6 overflow-y-auto">
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold text-white uppercase">User Management</h2>
            <div className="p-12 text-center border border-dashed border-border rounded-xl text-muted-foreground">
              User table component goes here.
            </div>
          </div>
        )}

        {activeTab === 'tournaments' && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold text-white uppercase">Tournament Moderation</h2>
            <div className="p-12 text-center border border-dashed border-border rounded-xl text-muted-foreground">
              Tournament list goes here.
            </div>
          </div>
        )}

        {activeTab === 'federations' && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold text-white uppercase">Federation Moderation</h2>
            <div className="p-12 text-center border border-dashed border-border rounded-xl text-muted-foreground">
              Federation list goes here.
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold text-white uppercase">Global Settings</h2>
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Site Title</label>
                <input type="text" defaultValue="FC CLUBS" className="w-full bg-black/20 border border-border rounded-md px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Maintenance Mode</label>
                <select className="w-full bg-black/20 border border-border rounded-md px-3 py-2 text-white">
                  <option value="off">Off</option>
                  <option value="on">On</option>
                </select>
              </div>
              <button className="cb-on-ink bg-primary font-bold py-2 px-4 rounded-md hover:bg-primary/90 transition-colors uppercase tracking-wider text-sm">
                Save
              </button>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold text-white uppercase">Feature Flags</h2>
            <div className="space-y-2 max-w-md">
              {['enable_fantasy', 'new_ui_beta', 'api_v2', 'recruitment_v2'].map(flag => (
                <div key={flag} className="flex items-center justify-between p-3 border border-border bg-black/20 rounded-lg">
                  <span className="text-white font-mono text-sm">{flag}</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bans' && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold text-white uppercase">Ban List</h2>
            <div className="p-12 text-center border border-dashed border-border rounded-xl text-muted-foreground">
              Banned users and IPs go here.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
