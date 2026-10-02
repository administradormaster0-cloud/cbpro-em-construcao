CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;
CREATE INDEX IF NOT EXISTS cbpro_player_handle_search ON public.fc_runtime_records USING gin ((doc #>> '{handle}') extensions.gin_trgm_ops) WHERE collection='player_profiles';
CREATE INDEX IF NOT EXISTS cbpro_player_platform_handle_search ON public.fc_runtime_records USING gin ((doc #>> '{platform_handle}') extensions.gin_trgm_ops) WHERE collection='player_profiles';
CREATE INDEX IF NOT EXISTS cbpro_team_name_search ON public.fc_runtime_records USING gin ((doc #>> '{name}') extensions.gin_trgm_ops) WHERE collection='teams';
CREATE INDEX IF NOT EXISTS cbpro_team_tag_search ON public.fc_runtime_records USING gin ((doc #>> '{tag}') extensions.gin_trgm_ops) WHERE collection='teams';
ANALYZE public.fc_runtime_records;
