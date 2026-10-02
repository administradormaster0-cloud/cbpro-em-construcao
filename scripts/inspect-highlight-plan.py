import json,pathlib,time,psycopg2
config=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'))
config['dbname']=config.pop('database');config.update(connect_timeout=12,application_name='cbpro-highlight-plan',options='-c statement_timeout=15000')
report={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
try:
 with psycopg2.connect(**config) as connection:
  with connection.cursor() as cursor:
   cursor.execute("select pg_get_functiondef('public.fn_top_performers_highlight()'::regprocedure)")
   definition=cursor.fetchone()[0]
   pathlib.Path('.impeccable/reconstruction/highlight-current.sql').write_text(definition,encoding='utf-8')
   statement=definition[definition.index('WITH base AS'):definition.index('  RETURN coalesce')].strip().replace('INTO result FROM best;','FROM best;')
   cursor.execute('EXPLAIN (FORMAT JSON) '+statement);report['plan']=cursor.fetchone()[0]
   cursor.execute("select relname,n_live_tup,n_dead_tup,last_analyze::text,last_autoanalyze::text from pg_stat_user_tables where relname in ('fc_rnk_player_cache','fc_rnk_cache_meta','fc_rnk_team_cache')")
   report['tables']=[dict(zip(['name','live','dead','analyzed','autoAnalyzed'],row)) for row in cursor.fetchall()]
   cursor.execute("select season_key,count(*) from public.fc_rnk_player_cache group by season_key")
   report['seasons']=[dict(zip(['season','players'],row)) for row in cursor.fetchall()]
   report['phase']='complete'
except Exception as error:report.update(failureType=type(error).__name__,sqlstate=getattr(error,'pgcode',None))
pathlib.Path('.impeccable/reconstruction/highlight-plan.json').write_text(json.dumps(report,indent=2,default=str),encoding='utf-8')
print(json.dumps(report,default=str))
