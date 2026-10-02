import pathlib,re
source=pathlib.Path('.impeccable/reconstruction/ranking-current-definition.sql').read_text(encoding='utf-8')
updated=source
for table in ['fc_rnk_player_cache','fc_rnk_team_cache','fc_rnk_cache_meta']:
 anchor=f'  DELETE FROM public.{table} WHERE season_key = v_key;'
 assert updated.count(anchor)==1
 updated=updated.replace(anchor,'')
anchor="    INSERT INTO public.fc_rnk_cache_meta(season_key, refreshed_at, player_count)"
assert updated.count(anchor)==1
updated=updated.replace(anchor,"    DELETE FROM public.fc_rnk_player_cache WHERE season_key=v_key;\n    DELETE FROM public.fc_rnk_team_cache WHERE season_key=v_key;\n"+anchor,1)
for kind,columns,key in [('players','season_key, player_profile_id, row','season_key, player_profile_id'),('teams','season_key, player_profile_id, team_id, row','season_key, player_profile_id, team_id')]:
 table='fc_rnk_player_cache' if kind=='players' else 'fc_rnk_team_cache'
 anchor=f'ins_{kind} AS (\n  INSERT INTO public.{table}({columns})'
 assert updated.count(anchor)==1
 updated=updated.replace(anchor,f'desired_{kind}({columns}) AS MATERIALIZED (',1)
 start=updated.index(f'desired_{kind}(')
 end=updated.index('  RETURNING 1\n  )',start)
 keys=[x.strip() for x in key.split(',')]
 equality=' AND '.join(f'd.{k}=c.{k}' for k in keys)
 replacement=f'''  ),
  ins_{kind} AS (
    INSERT INTO public.{table} AS c({columns})
    SELECT {columns} FROM desired_{kind}
    ON CONFLICT ({key}) DO UPDATE SET row=EXCLUDED.row
    WHERE c.row IS DISTINCT FROM EXCLUDED.row
    RETURNING 1
  ),
  del_{kind} AS (
    DELETE FROM public.{table} c WHERE c.season_key=v_key
    AND NOT EXISTS (SELECT 1 FROM desired_{kind} d WHERE {equality})
    RETURNING 1
  )'''
 updated=updated[:end]+replacement+updated[end+len('  RETURNING 1\n  )'):]
updated=updated.replace('FROM (SELECT count(*) AS c FROM ins_players) p','FROM (SELECT count(*) AS c FROM desired_players) p')
updated=updated.replace('CROSS JOIN (SELECT count(*) AS c FROM ins_teams) t;','CROSS JOIN (SELECT count(*) AS c FROM desired_teams) t;')
updated=updated.replace('VALUES (v_key, clock_timestamp(), 0);','VALUES (v_key, clock_timestamp(), 0)\n    ON CONFLICT (season_key) DO UPDATE SET refreshed_at=EXCLUDED.refreshed_at,player_count=0;')
updated=updated.replace('VALUES (v_key, clock_timestamp(), coalesce(v_count, 0));','VALUES (v_key, clock_timestamp(), coalesce(v_count, 0))\n  ON CONFLICT (season_key) DO UPDATE SET refreshed_at=EXCLUDED.refreshed_at,player_count=EXCLUDED.player_count;')
# Preserve every calculation SELECT byte-for-byte, apart from its container.
for kind in ['players','teams']:
 oldstart=source.index('  SELECT v_key,',source.index(f'ins_{kind} AS ('))
 oldend=source.index('  RETURNING 1',oldstart)
 assert source[oldstart:oldend] in updated
assert updated.count('IS DISTINCT FROM EXCLUDED.row')==2
path=pathlib.Path('supabase/migrations/20261002024000_ranking_delta_cache.sql')
path.write_text(updated,encoding='utf-8')
print('Prepared delta-cache migration; scoring SELECTs retained exactly. Not deployed.')
