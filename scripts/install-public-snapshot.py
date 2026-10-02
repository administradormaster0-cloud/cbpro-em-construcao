import json,pathlib,psycopg2
from psycopg2 import sql
cfg=json.load(open(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json',encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');c=psycopg2.connect(**cfg)
queries=json.load(open('data/public-route-queries.json',encoding='utf-8'))
allowed={'fn_rnk_ensure_fresh','fc_public_select','fn_top_performers_highlight','fn_recruitment_public_feed','fn_rnk_top_trophies','fn_season_pro_players_icons'}
queries={route:[x for x in entries if x['name'] in allowed and x.get('args',{}).get('p_collection') not in ('drafts','draft_entries')] for route,entries in queries.items()}
for x in queries['home']:
 if x['name']=='fc_public_select' and x['args'].get('p_collection') in ['player_profiles','match_series','tournaments'] and x['args'].get('p_filter',{}).get('children')==[]:
  x['args']['p_head']=True
import re
for entries in queries.values():
 for x in entries:
  if x['name']=='fc_public_select': x['args']['p_order']=[order for order in x['args']['p_order'] if re.fullmatch(r'[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)*',order['key'])]
seed=sql.Literal(json.dumps(queries)).as_string(c)
s='''CREATE TABLE IF NOT EXISTS public.cbpro_public_route_snapshots(route text PRIMARY KEY,payload jsonb NOT NULL,refreshed_at timestamptz NOT NULL);
ALTER TABLE public.cbpro_public_route_snapshots ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cbpro_public_route_snapshots FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.cbpro_refresh_public_snapshot() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public SET statement_timeout='90s' AS $fn$
DECLARE seed jsonb := '''+seed+'''::jsonb; item jsonb; a jsonb; result jsonb; entries jsonb:='[]'::jsonb; route_entry record; query_results jsonb:='{}'::jsonb; query_key text;
BEGIN
 IF NOT pg_try_advisory_xact_lock(78203791) THEN RETURN; END IF;
 FOR route_entry IN SELECT key,value FROM jsonb_each(seed) LOOP
 entries:='[]'::jsonb;
 FOR item IN SELECT value FROM jsonb_array_elements(route_entry.value) LOOP
 a:=item->'args';
 IF a->>'p_collection'='ranking_seasons' THEN a:=regexp_replace(a::text,'[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9:.]+Z',to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'g')::jsonb; END IF;
 BEGIN
 query_key:=jsonb_build_array(item->>'name',a)::text;
 IF query_results ? query_key THEN result:=query_results->query_key; ELSE
 CASE item->>'name'
 WHEN 'fc_public_select' THEN result:=public.fc_public_select(a->>'p_collection',a->'p_filter',a->'p_order',CASE WHEN a->>'p_head'='true' THEN 0 ELSE (a->>'p_limit')::integer END,(a->>'p_offset')::integer);
 WHEN 'fn_rnk_ensure_fresh' THEN result:=public.fn_rnk_ensure_fresh(a->>'p_season_id');
 WHEN 'fn_top_performers_highlight' THEN result:=public.fn_top_performers_highlight();
 WHEN 'fn_recruitment_public_feed' THEN result:=public.fn_recruitment_public_feed(a->>'p_ad_type',a->>'p_game_id',a->>'p_country_id',(a->>'p_primary_position_id')::integer,coalesce((a->>'p_limit')::integer,50),coalesce((a->>'p_offset')::integer,0));
 WHEN 'fn_rnk_top_trophies' THEN result:=public.fn_rnk_top_trophies(a->>'p_season_id',coalesce((a->>'p_limit')::integer,10),a->>'p_country_id');
 WHEN 'fn_season_pro_players_icons' THEN result:=public.fn_season_pro_players_icons(a->>'p_season_id',a->>'p_country_id');
 ELSE CONTINUE;
 END CASE;
 query_results:=query_results||jsonb_build_object(query_key,result);
 END IF;
 entries:=entries||jsonb_build_array(item||jsonb_build_object('args',a,'result',result));
 EXCEPTION WHEN invalid_parameter_value THEN CONTINUE; END;
 END LOOP;
 INSERT INTO public.cbpro_public_route_snapshots(route,payload,refreshed_at) VALUES(route_entry.key,entries,clock_timestamp()) ON CONFLICT(route) DO UPDATE SET payload=excluded.payload,refreshed_at=excluded.refreshed_at;
 END LOOP;
 IF to_regprocedure('public.cbpro_publish_public_snapshots()') IS NOT NULL THEN PERFORM public.cbpro_publish_public_snapshots(); END IF;
END;$fn$;
REVOKE ALL ON FUNCTION public.cbpro_refresh_public_snapshot() FROM PUBLIC,anon,authenticated;
DROP FUNCTION IF EXISTS public.cbpro_get_public_snapshot();
CREATE OR REPLACE FUNCTION public.cbpro_get_public_snapshot(p_route text) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,public AS $fn$ SELECT jsonb_build_object('entries',payload,'refreshed_at',refreshed_at) FROM public.cbpro_public_route_snapshots WHERE route=p_route; $fn$;
REVOKE ALL ON FUNCTION public.cbpro_get_public_snapshot(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cbpro_get_public_snapshot(text) TO anon,authenticated;
SELECT public.cbpro_refresh_public_snapshot();
SELECT cron.schedule('cbpro-refresh-public-snapshot','2-59/5 * * * *','SELECT public.cbpro_refresh_public_snapshot();');
NOTIFY pgrst,'reload schema';
'''
pathlib.Path('supabase/cbpro-public-snapshot.sql').write_text(s,encoding='utf-8')
q=c.cursor();q.execute(s);c.commit();q.execute('select route,jsonb_array_length(payload),pg_column_size(payload) from public.cbpro_public_route_snapshots');print(q.fetchall());c.close()
