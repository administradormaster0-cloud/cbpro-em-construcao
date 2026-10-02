import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useTournaments(filters?: { featured?: boolean }) {
  const queryClient = useQueryClient();

  const tournamentsQuery = useQuery({
    queryKey: ['tournaments', filters],
    queryFn: async () => {
      let query = supabase
        .from('tournaments')
        .select('id,name,scope,status,ends_at')
        .order('ends_at', { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const createTournament = useMutation({
    mutationFn: async (data: any) => {
      return { id: '1' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });

  return {
    tournaments: tournamentsQuery.data || [],
    isLoading: tournamentsQuery.isLoading,
    isError: tournamentsQuery.isError,
    createTournament,
  };
}