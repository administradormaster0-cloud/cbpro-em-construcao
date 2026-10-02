import React from 'react';

interface GroupStandingsProps {
  groupName: string;
  standings: any[];
}

export function GroupStandings({ groupName, standings }: GroupStandingsProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-800 overflow-hidden mb-6">
      <div className="bg-gray-900 px-4 py-3 border-b border-gray-800">
        <h4 className="font-bold text-white">{groupName}</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
            <tr>
              <th className="px-4 py-3">POS</th>
              <th className="px-4 py-3">EQUIPE</th>
              <th className="px-3 py-3 text-center">P</th>
              <th className="px-3 py-3 text-center">V</th>
              <th className="px-3 py-3 text-center">E</th>
              <th className="px-3 py-3 text-center">D</th>
              <th className="px-3 py-3 text-center">GP</th>
              <th className="px-3 py-3 text-center">GC</th>
              <th className="px-3 py-3 text-center">SG</th>
              <th className="px-3 py-3 text-center font-bold text-[#0A2560]">PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, index) => (
              <tr key={team.id || index} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="px-4 py-3 font-medium">{index + 1}</td>
                <td className="px-4 py-3 flex items-center gap-2">
                  {team.logo && <img src={team.logo} alt="" className="w-6 h-6 rounded-full" />}
                  <span>{team.name}</span>
                </td>
                <td className="px-3 py-3 text-center">{team.matches_played || 0}</td>
                <td className="px-3 py-3 text-center">{team.wins || 0}</td>
                <td className="px-3 py-3 text-center">{team.draws || 0}</td>
                <td className="px-3 py-3 text-center">{team.losses || 0}</td>
                <td className="px-3 py-3 text-center">{team.goals_for || 0}</td>
                <td className="px-3 py-3 text-center">{team.goals_against || 0}</td>
                <td className="px-3 py-3 text-center">{team.goal_difference || 0}</td>
                <td className="px-3 py-3 text-center font-bold text-[#0A2560]">{team.points || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
