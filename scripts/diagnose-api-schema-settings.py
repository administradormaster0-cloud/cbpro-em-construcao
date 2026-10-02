import json,pathlib,time,psycopg2
config=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));config['dbname']=config.pop('database');config.update(connect_timeout=12,application_name='cbpro-schema-diagnostic',options='-c statement_timeout=10000')
report={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'phase':'connecting'}
try:
 with psycopg2.connect(**config) as connection:
  report['phase']='querying'
  with connection.cursor() as cursor:
   cursor.execute("select nspname from pg_namespace where nspname in ('public','graphql_public','extensions')");report['schemas']=[r[0] for r in cursor.fetchall()]
   cursor.execute("select rolname,setting from pg_roles cross join lateral unnest(coalesce(rolconfig,'{}')) setting where rolname='authenticator' and (setting like 'pgrst.db_schemas=%' or setting like 'statement_timeout=%' or setting like 'lock_timeout=%')");report['roleSettings']=[{'role':r[0],'setting':r[1]} for r in cursor.fetchall()]
   cursor.execute("select application_name,state,wait_event_type,wait_event,extract(epoch from clock_timestamp()-query_start)::integer seconds,left(query,180) query from pg_stat_activity where state='active' and pid<>pg_backend_pid() order by query_start limit 6");report['activity']=[{'application':r[0],'state':r[1],'wait_type':r[2],'wait':r[3],'seconds':r[4],'query':r[5]} for r in cursor.fetchall()]
  report['phase']='complete'
except Exception as error:report.update(failureType=type(error).__name__,sqlstate=getattr(error,'pgcode',None))
pathlib.Path('.impeccable/reconstruction/api-schema-current-settings.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
