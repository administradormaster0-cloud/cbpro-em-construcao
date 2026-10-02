import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRankedProfiles, useTeams } from '@/hooks/useData';
import { useTournaments } from '@/hooks/useTournaments';

function rankLabel(row: any) {
  return row?.teams?.name || row?.teams?.tag || row?.tier || 'Sem nome';
}

function liveChip(status?: string) {
  const value = String(status || '').toUpperCase();
  if (['ONGOING', 'RUNNING', 'LIVE', 'IN_PROGRESS'].includes(value)) {
    return <span className="cb-chip cb-chip-live">Ao vivo</span>;
  }
  return null;
}

export default function Landing() {
  const { user } = useAuth();
  const teamsQuery = useTeams();
  const rankedQuery = useRankedProfiles();
  const { tournaments, isLoading: cupsLoading, isError: cupsError } = useTournaments();
  const cups = (tournaments || []).slice(0, 8);
  const ranked = (rankedQuery.data || []).slice(0, 8);
  const teams = (teamsQuery.data || []).slice(0, 8);

  return (
    <div className="max-w-6xl mx-auto px-4">
      <section className="pt-10 pb-8">
        <img src="/brand/logo-lockup.png" alt="CBPRO" style={{ height: 52, width: 'auto' }} />
        <h1 className="mt-5 text-4xl sm:text-[3.25rem] text-[#0A2560] max-w-2xl leading-none">
          O circuito profissional, em ordem.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-[#3A4566]">
          Circuito Brasileiro Profissional. Veja os campeonatos, o ranking e os times antes de entrar.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="cb-btn" to="/tournaments-public">Ver campeonatos</Link>
          <a className="cb-btn cb-btn-line" href="#ranking">Ver ranking</a>
          {user ? (
            <Link className="cb-btn cb-btn-line" to="/dashboard">Painel</Link>
          ) : (
            <Link className="cb-btn cb-btn-line" to="/login">Entrar</Link>
          )}
        </div>
      </section>

      <section className="py-4" aria-label="Campeonatos">
        <div className="flex items-baseline justify-between gap-3 border-b border-[#DCE2EC] pb-2">
          <h2 className="text-2xl text-[#0A2560]">Campeonatos</h2>
          <span className="cb-chip cb-chip-gold">Rodada</span>
        </div>
        {cupsLoading && <p className="py-4 text-sm text-[#3A4566]">Carregando...</p>}
        {cupsError && <p className="py-4 text-sm text-[#3A4566]">Não foi possível carregar os campeonatos.</p>}
        {!cupsLoading && cups.length === 0 && (
          <p className="py-4 text-sm text-[#3A4566]">Nenhum campeonato carregado agora.</p>
        )}
        {cups.map((cup: any, index: number) => (
          <Link key={cup.id} to={'/tournament/' + cup.id} className="cb-row">
            <span className="cb-score text-lg">{String(index + 1).padStart(2, '0')}</span>
            <span className="font-semibold truncate">{cup.name}</span>
            <span className="flex items-center gap-2">
              {liveChip(cup.status)}
              <span className="cb-score text-lg">{cup.scope || ''}</span>
            </span>
          </Link>
        ))}
      </section>

      <section id="ranking" className="py-6" aria-label="Ranking">
        <div className="flex items-baseline justify-between gap-3 border-b border-[#DCE2EC] pb-2">
          <h2 className="text-2xl text-[#0A2560]">Ranking</h2>
          <span className="cb-chip cb-chip-elo">V</span>
        </div>
        {rankedQuery.isLoading && <p className="py-4 text-sm text-[#3A4566]">Carregando...</p>}
        {rankedQuery.isError && <p className="py-4 text-sm text-[#3A4566]">Não foi possível carregar o ranking.</p>}
        {!rankedQuery.isLoading && !rankedQuery.isError && ranked.length === 0 && (
          <p className="py-4 text-sm text-[#3A4566]">Nenhum jogador no ranking ainda.</p>
        )}
        {ranked.map((row: any, index: number) => (
          <Link key={row.id || index} to={row.team_id ? '/t/' + row.team_id : '/players-public'} className="cb-row">
            <span className="cb-score text-lg">{String(index + 1).padStart(2, '0')}</span>
            <span className="font-semibold truncate">{rankLabel(row)}</span>
            <span className="flex items-center gap-2">
              <span className="cb-chip cb-chip-elo">V</span>
              <span className="cb-score text-xl">{row.wins ?? ''}</span>
            </span>
          </Link>
        ))}
      </section>

      <section className="py-6 pb-10" aria-label="Times">
        <div className="flex items-baseline justify-between gap-3 border-b border-[#DCE2EC] pb-2">
          <h2 className="text-2xl text-[#0A2560]">Times</h2>
          <Link to="/teams-public" className="text-xs font-bold text-[#0B4DA2]">Ver todos</Link>
        </div>
        {teamsQuery.isLoading && <p className="py-4 text-sm text-[#3A4566]">Carregando...</p>}
        {teamsQuery.isError && <p className="py-4 text-sm text-[#3A4566]">Não foi possível carregar os times.</p>}
        {!teamsQuery.isLoading && !teamsQuery.isError && teams.length === 0 && (
          <p className="py-4 text-sm text-[#3A4566]">Nenhum time carregado agora.</p>
        )}
        {teams.map((team: any, index: number) => (
          <Link key={team.id || index} to={'/t/' + team.id} className="cb-row">
            <span className="cb-score text-lg">{String(index + 1).padStart(2, '0')}</span>
            <span className="font-semibold truncate">{team.name || 'Time'}</span>
            <span className="text-xs font-bold tracking-wide text-[#3A4566]">
              {team.tag || ''}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}