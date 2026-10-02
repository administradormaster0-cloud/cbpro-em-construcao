import json,pathlib,time,psycopg2
root=pathlib.Path('.impeccable/reconstruction')
config=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'))
config['dbname']=config.pop('database');config.update(connect_timeout=12,application_name='cbpro-highlight-width',options='-c statement_timeout=45000 -c lock_timeout=3000')
report={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'applied':False}
def query(definition):
 return definition[definition.index('WITH base AS'):definition.index('  RETURN coalesce')].strip().replace('INTO result FROM best','FROM best')
def narrow(original):
 if original.count('SELECT c.row,')!=1 or original.count("row->>'player_profile_id'")!=1:raise ValueError('Unexpected definition')
 candidate=original.replace('SELECT c.row,',"SELECT c.player_profile_id AS cache_player_id, c.row->>'player_profile_id' AS tie_player_id,",1)
 candidate=candidate.replace('), scored AS (', '), scored AS MATERIALIZED (',1).replace("score_per_match DESC, row->>'player_profile_id'",'score_per_match DESC, tie_player_id',1)
 candidate=candidate.replace("((row || jsonb_build_object('pos_category', pos_category, 'score_per_match', score_per_match)) ORDER BY pos_category)","((c.row || jsonb_build_object('pos_category', best.pos_category, 'score_per_match', best.score_per_match)) ORDER BY best.pos_category)",1)
 candidate=candidate.replace('INTO result FROM best;','INTO result FROM best JOIN public.fc_rnk_player_cache c ON c.season_key = \'\' AND c.player_profile_id = best.cache_player_id;',1)
 return candidate
root.joinpath('highlight-width-candidate.sql').write_text(narrow(root.joinpath('highlight-current.sql').read_text(encoding='utf-8')),encoding='utf-8')
try:
 with psycopg2.connect(**config) as connection:
  with connection.cursor() as cursor:
   cursor.execute("select pg_get_functiondef('public.fn_top_performers_highlight()'::regprocedure)")
   original=cursor.fetchone()[0]
   candidate=narrow(original)
   root.joinpath('highlight-width-candidate.sql').write_text(candidate,encoding='utf-8')
   cursor.execute('EXPLAIN (FORMAT JSON) '+query(candidate));report['candidatePlan']=cursor.fetchone()[0]
   # Both calculations use the same committed dataset and snapshot. No output profiles are logged.
   cursor.execute('WITH old_result AS MATERIALIZED ('+query(original).rstrip(';')+'), new_result AS MATERIALIZED ('+query(candidate).rstrip(';')+') SELECT (SELECT * FROM old_result) = (SELECT * FROM new_result)')
   report['resultsEqual']=cursor.fetchone()[0]
   if not report['resultsEqual']:raise ValueError('Result mismatch')
   root.joinpath('highlight-before-width.sql').write_text(original,encoding='utf-8')
   cursor.execute(candidate)
   cursor.execute("select pg_get_functiondef('public.fn_top_performers_highlight()'::regprocedure)")
   report['definitionVerified']=cursor.fetchone()[0]==candidate
   if not report['definitionVerified']:raise ValueError('Definition verification failed')
  connection.commit();report['applied']=True
except Exception as error:report.update(failureType=type(error).__name__,sqlstate=getattr(error,'pgcode',None))
root.joinpath('highlight-width-optimization.json').write_text(json.dumps(report,indent=2,default=str),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='candidatePlan'},default=str))
