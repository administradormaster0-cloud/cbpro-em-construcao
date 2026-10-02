import json,pathlib,time,psycopg2
config=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'))
config['dbname']=config.pop('database');config.update(connect_timeout=12,application_name='cbpro-ranking-io-inspection',options='-c statement_timeout=15000')
report={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
try:
 with psycopg2.connect(**config) as connection:
  with connection.cursor() as cursor:
   cursor.execute("select pg_get_functiondef('public.fn_rnk_refresh(text)'::regprocedure)")
   pathlib.Path('.impeccable/reconstruction/ranking-current-definition.sql').write_text(cursor.fetchone()[0],encoding='utf-8')
   cursor.execute("select current_setting('work_mem'),current_setting('shared_buffers'),current_setting('pg_stat_statements.track')")
   report['settings']=dict(zip(['workMem','sharedBuffers','statementTracking'],cursor.fetchone()))
   cursor.execute("select tablename,indexname,indexdef from pg_indexes where schemaname='public' and tablename in ('fc_runtime_records','fc_rnk_player_cache','fc_rnk_team_cache','fc_rnk_cache_meta')")
   report['indexes']=[dict(zip(['table','name','definition'],row)) for row in cursor.fetchall()]
   cursor.execute("select jobname,schedule,active from cron.job where jobname in ('cbpro-refresh-rankings','cbpro-refresh-public-snapshot')")
   report['jobs']=[dict(zip(['name','schedule','active'],row)) for row in cursor.fetchall()]
   report['phase']='complete'
except Exception as error:report.update(failureType=type(error).__name__,sqlstate=getattr(error,'pgcode',None))
pathlib.Path('.impeccable/reconstruction/ranking-io-inspection.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
