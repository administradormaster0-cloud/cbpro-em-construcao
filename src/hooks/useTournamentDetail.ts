import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export function useTournamentDetail(idOverride?: string) {
  const params = useParams<{ id: string }>();
  const id = idOverride || params.id;

  const { data: tournament, isLoading: isTournamentLoading } = useQuery({
    queryKey: ['tournament', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('tournaments')
        .select('*, entrants(count)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: stages, isLoading: isStagesLoading } = useQuery({
    queryKey: ['tournament-stages', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('tournament_stages')
        .select('*')
        .eq('tournament_id', id)
        .order('stage_order');
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const { data: groups } = useQuery({
    queryKey: ['tournament-groups', id],
    queryFn: async () => {
      if (!stages || stages.length === 0) return [];
      const stageIds = stages.map((s: any) => s.id);
      const { data, error } = await supabase
        .from('stage_groups')
        .select('*')
        .in('stage_id', stageIds)
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!stages && stages.length > 0,
  });

  const { data: standings } = useQuery({
    queryKey: ['tournament-standings', id],
    queryFn: async () => {
      if (!stages || stages.length === 0) return [];
      const stageIds = stages.map((s: any) => s.id);
      const { data, error } = await supabase
        .from('stage_standings')
        .select('*, entrants(*, teams(*))')
        .in('stage_id', stageIds)
        .order('position');
      if (error) throw error;
      return data || [];
    },
    enabled: !!stages && stages.length > 0,
  });

  const { data: entrants } = useQuery({
    queryKey: ['tournament-entrants', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('entrants')
        .select('*, teams(*)')
        .eq('tournament_id', id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const { data: matchSeries } = useQuery({
    queryKey: ['tournament-matches', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('match_series')
        .select('*, series_games(*)')
        .eq('tournament_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  return {
    tournament,
    stages: stages || [],
    groups: groups || [],
    standings: standings || [],
    entrants: entrants || [],
    matchSeries: matchSeries || [],
    isLoading: isTournamentLoading || isStagesLoading,
  };
}
