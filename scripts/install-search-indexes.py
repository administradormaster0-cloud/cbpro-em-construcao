import json,psycopg2,pathlib
cfg=json.load(open(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json',encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');c=psycopg2.connect(**cfg);q=c.cursor();s='''CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;
CREATE INDEX IF NOT EXISTS cbpro_player_handle_search ON public.fc_runtime_records USING gin ((doc #>> '{handle}') extensions.gin_trgm_ops) WHERE collection='player_profiles';
CREATE INDEX IF NOT EXISTS cbpro_player_platform_handle_search ON public.fc_runtime_records USING gin ((doc #>> '{platform_handle}') extensions.gin_trgm_ops) WHERE collection='player_profiles';
CREATE INDEX IF NOT EXISTS cbpro_team_name_search ON public.fc_runtime_records USING gin ((doc #>> '{name}') extensions.gin_trgm_ops) WHERE collection='teams';
CREATE INDEX IF NOT EXISTS cbpro_team_tag_search ON public.fc_runtime_records USING gin ((doc #>> '{tag}') extensions.gin_trgm_ops) WHERE collection='teams';
ANALYZE public.fc_runtime_records;
''';pathlib.Path('supabase/cbpro-search-indexes.sql').write_text(s,encoding='utf-8');q.execute(s);c.commit();print('Search indexes installed');c.close()
