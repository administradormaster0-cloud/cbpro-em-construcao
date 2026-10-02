import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// ═══ Teams ═══
export function useTeams(federationId?: string) {
  return useQuery({
    queryKey: ['teams', federationId],
    queryFn: async () => {
      let query = supabase.from('teams').select('id,tag,name')
      if (federationId) query = query.eq('federation_id', federationId)
      const { data, error } = await query.order('name')
      if (error) throw error
      return data
    },
  })
}

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*, team_players(*, player_profiles(*)), team_managers(*)')
        .eq('id', teamId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!teamId,
  })
}

// ═══ Players ═══
export function usePlayerProfiles(options?: { limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['player_profiles', options],
    queryFn: async () => {
      let query = supabase.from('player_profiles').select('*')
      if (options?.search) query = query.ilike('gamertag', `%${options.search}%`)
      if (options?.limit) query = query.limit(options.limit)
      const { data, error } = await query.order('gamertag')
      if (error) throw error
      return data
    },
  })
}

// ═══ Federations ═══
export function useFederations() {
  return useQuery({
    queryKey: ['federations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('federations')
        .select('*, federation_followers(count), federation_games(*, games(*))')
        .order('name')
      if (error) throw error
      return data
    },
  })
}

export function useFederation(id: string) {
  return useQuery({
    queryKey: ['federation', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('federations')
        .select('*, federation_customizations(*), federation_countries(*, countries(*)), federation_games(*, games(*)), federation_gallery(*), federation_regulations(*)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

// ═══ Games & Platforms ═══
export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select('*, game_platforms(*, platforms(*))')
        .eq('is_visible', true)
        .order('name')
      if (error) throw error
      return data
    },
  })
}

// ═══ Countries & States ═══
export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const { data, error } = await supabase.from('countries').select('*').order('name')
      if (error) throw error
      return data
    },
    staleTime: Infinity,
  })
}

export function useStates(countryId?: string) {
  return useQuery({
    queryKey: ['states', countryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('states')
        .select('*')
        .eq('country_id', countryId!)
        .order('name')
      if (error) throw error
      return data
    },
    enabled: !!countryId,
    staleTime: Infinity,
  })
}

// ═══ Rankings ═══
export function useRankedProfiles() {
  return useQuery({
    queryKey: ['ranked_profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ranked_profiles')
        .select('id,mode,tier,wins,draws,losses,team_id,teams(id,name,tag)')
        .order('wins', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useRankingSeasons() {
  return useQuery({
    queryKey: ['ranking_seasons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ranking_seasons')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

// ═══ ELO ═══
export function useEloSeasons(federationId?: string) {
  return useQuery({
    queryKey: ['elo_seasons', federationId],
    queryFn: async () => {
      let query = supabase.from('elo_federation_seasons').select('*, elo_season_tiers(*, elo_season_teams(count))')
      if (federationId) query = query.eq('federation_id', federationId)
      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

// ═══ Fantasy ═══
export function useFantasyLeagues() {
  return useQuery({
    queryKey: ['fantasy_leagues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fantasy_leagues')
        .select('*, fantasy_league_members(count)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

// ═══ Drafts ═══
export function useDrafts() {
  return useQuery({
    queryKey: ['drafts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drafts')
        .select('*, draft_entries(count)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

// ═══ Site Settings ═══
export function useSiteSettings() {
  return useQuery({
    queryKey: ['site_settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*')
      if (error) throw error
      return data
    },
    staleTime: Infinity,
  })
}

export function useFeatureFlags() {
  return useQuery({
    queryKey: ['feature_flags'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_feature_flags').select('*')
      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 10,
  })
}

// ═══ Plans & Credits ═══
export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('active', true)
        .order('sort_order')
      if (error) throw error
      return data
    },
    staleTime: Infinity,
  })
}

export function useCreditPackages() {
  return useQuery({
    queryKey: ['credit_packages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('credit_packages').select('*').order('credits')
      if (error) throw error
      return data
    },
    staleTime: Infinity,
  })
}

// ═══ Tiers ═══
export function useTiers() {
  return useQuery({
    queryKey: ['tiers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tiers').select('*').order('sort_order')
      if (error) throw error
      return data
    },
    staleTime: Infinity,
  })
}
