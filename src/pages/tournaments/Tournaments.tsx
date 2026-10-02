import { useState } from 'react';
import { useTournaments } from '@/hooks/useTournaments';
import { Link } from 'react-router-dom';

export default function Tournaments() {
  const { tournaments, isLoading } = useTournaments();
  const [filter, setFilter] = useState('ALL');

  if (isLoading) return <div className="p-8 text-sm text-[#3A4566]">Carregando campeonatos...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl text-[#0A2560]">Campeonatos</h1>
          <p className="text-sm text-[#3A4566] mt-1">Acompanhe as competições do circuito.</p>
        </div>
        <input
          type="text"
          placeholder="Buscar campeonato..."
          className="px-3 py-2 bg-white border border-[#DCE2EC] rounded-sm text-sm text-[#2A3555] focus:outline-none focus:border-[#0B4DA2]"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {['ALL', 'UPCOMING', 'ONGOING', 'COMPLETED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={'cb-chip ' + (filter === status ? 'cb-chip-gold' : 'cb-chip-elo')}
          >
            {status === 'ALL' ? 'Todos' : status === 'UPCOMING' ? 'Em breve' : status === 'ONGOING' ? 'Ao vivo' : 'Encerrados'}
          </button>
        ))}
      </div>

      <div>
        {tournaments?.map((tournament: any, index: number) => (
          <Link key={tournament.id} to={'/tournaments/' + tournament.id} className="cb-row">
            <span className="cb-score text-lg">{String(index + 1).padStart(2, '0')}</span>
            <span className="min-w-0">
              <span className="block font-semibold truncate">{tournament.name}</span>
              <span className="block text-xs text-[#3A4566]">{tournament.created_at ? new Date(tournament.created_at).toLocaleDateString('pt-BR') : ''}</span>
            </span>
            <span className="flex items-center gap-2">
              {String(tournament.status || '').toUpperCase() === 'ONGOING' ? <span className="cb-chip cb-chip-live">Ao vivo</span> : <span className="cb-chip cb-chip-gold">Rodada</span>}
              <span className="cb-score text-lg">{tournament.entrants?.[0]?.count ?? tournament.participant_count ?? 0}</span>
            </span>
          </Link>
        ))}
        {(!tournaments || tournaments.length === 0) && (
          <p className="py-8 text-sm text-[#3A4566] border-b border-[#E3E7EF]">Nenhum campeonato encontrado.</p>
        )}
      </div>
    </div>
  );
}