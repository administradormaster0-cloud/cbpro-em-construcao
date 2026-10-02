import React from 'react';

export function CreateTournamentDialog({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Create Tournament</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <div className="p-6 space-y-6 text-gray-300">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm mb-1">Game</label>
              <select className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white">
                <option>EA FC 24</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" rows={3}></textarea>
          </div>
          <div className="border-t border-gray-800 pt-4">
            <h3 className="text-lg font-bold text-white mb-2">Rules & Format</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1">Groups</label>
                <input type="number" defaultValue={2} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
              </div>
              <div>
                <label className="block text-sm mb-1">Advance per Group</label>
                <input type="number" defaultValue={2} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
              </div>
              <div>
                <label className="block text-sm mb-1">Best Thirds</label>
                <input type="number" defaultValue={0} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-4">
            <h3 className="text-lg font-bold text-white mb-2">Fees & Prizes</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Entry Fee</label>
                <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" placeholder="0.00" />
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded text-gray-300 hover:bg-gray-800">Cancel</button>
          <button className="px-4 py-2 cb-on-ink bg-[#0A2560] font-bold rounded hover:bg-[#0B4DA2]">Create</button>
        </div>
      </div>
    </div>
  );
}
