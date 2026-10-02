import { useState } from 'react';
import { useEloSeasons } from '@/hooks/useData';

export default function Ranked() {
  const { data: rankings, isLoading, isError } = useEloSeasons();
  const [season, setSeason] = useState('current');
  const rows = Array.isArray(rankings) ? rankings : [];

  if (isLoading) return <div className="p-8 text-sm text-[#3A4566]">Carregando ranking...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl text-[#0A2560]">Ranking</h1>
          <p className="text-sm text-[#3A4566] mt-1">Tabela do circuito, por temporada.</p>
        </div>
        <select
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          className="bg-white border border-[#DCE2EC] rounded-sm px-3 py-2 text-sm text-[#2A3555]"
        >
          <option value="current">Temporada atual</option>
          <option value="s1">Temporada 1</option>
          <option value="s2">Temporada 2</option>
        </select>
      </div>
      {isError && <p className="text-sm text-[#3A4566]">Não foi possível carregar o ranking.</p>}
      {!isError && rows.length === 0 && <p className="text-sm text-[#3A4566]">Nenhuma temporada carregada.</p>}
      {rows.map((row: any, index: number) => (
        <div key={row.id || index} className="cb-row">
          <span className="cb-score text-lg">{String(index + 1).padStart(2, '0')}</span>
          <span className="font-semibold truncate">{row.name || row.title || 'Temporada'}</span>
          <span className="flex items-center gap-2">
            <span className="cb-chip cb-chip-elo">Elo</span>
            <span className="cb-score text-xl">{Array.isArray(row.elo_season_tiers) ? row.elo_season_tiers.length : '—'}</span>
          </span>
        </div>
      ))}
    </div>
  );
}