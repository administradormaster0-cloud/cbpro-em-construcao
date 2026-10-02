import React from 'react';
import { Settings, Image, Shield, Users } from 'lucide-react';

export default function OrgManage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-white uppercase tracking-tight">Manage Federation</h1>
        <p className="text-muted-foreground mt-1">Update your organization's public profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-display font-bold text-white uppercase flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" /> General Info
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Organization Name</label>
                <input type="text" className="w-full bg-black/20 border border-border rounded-md px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                <textarea rows={4} className="w-full bg-black/20 border border-border rounded-md px-3 py-2 text-white resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Country</label>
                  <input type="text" className="w-full bg-black/20 border border-border rounded-md px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Website</label>
                  <input type="url" className="w-full bg-black/20 border border-border rounded-md px-3 py-2 text-white" />
                </div>
              </div>
              <button className="cb-on-ink bg-primary font-bold py-2 px-6 rounded-md hover:bg-primary/90 transition-colors uppercase tracking-wider text-sm">
                Save Changes
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-display font-bold text-white uppercase flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" /> Branding
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Logo</label>
                <div className="w-full aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer bg-black/20">
                  <Shield className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">Upload Logo</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Cover Image</label>
                <div className="w-full aspect-video border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer bg-black/20">
                  <Image className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">Upload Cover</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-display font-bold text-white uppercase flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Members
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Manage admins and staff members for your federation.</p>
            <button className="w-full bg-black/40 border border-border text-white font-bold py-2 rounded-md hover:bg-white/5 transition-colors uppercase tracking-wider text-sm">
              Manage Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
