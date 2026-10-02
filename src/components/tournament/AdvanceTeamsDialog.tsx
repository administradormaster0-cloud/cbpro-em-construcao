import React from 'react';

export function AdvanceTeamsDialog({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-800 rounded-xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Advance Teams</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <div className="p-6">
          <p className="text-gray-300 mb-4">Advance qualified teams to the playoffs bracket.</p>
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 text-sm text-gray-400">
            This will lock the group stage and generate the first round of the playoffs.
          </div>
        </div>
        <div className="p-6 border-t border-gray-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded text-gray-300 hover:bg-gray-800">Cancel</button>
          <button className="px-4 py-2 cb-on-ink bg-[#0A2560] font-bold rounded hover:bg-[#0B4DA2]">Confirm & Advance</button>
        </div>
      </div>
    </div>
  );
}
