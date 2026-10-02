import json,pathlib,time,psycopg2
config=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));config['dbname']=config.pop('database');config.update(connect_timeout=12,application_name='cbpro-capacity-inspection',options='-c statement_timeout=12000')
report={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
try:
 with psycopg2.connect(**config) as connection:
  with connection.cursor() as cursor:
   cursor.execute("select name,setting,unit from pg_settings where name in ('max_connections','superuser_reserved_connections','max_worker_processes','max_parallel_workers','cron.use_background_workers','cron.max_running_jobs')")
   report['settings']=[dict(zip(['name','value','unit'],row)) for row in cursor.fetchall()]
   cursor.execute("select backend_type,state,wait_event_type,wait_event,count(*) from pg_stat_activity group by 1,2,3,4 order by count(*) desc")
   report['activity']=[dict(zip(['backendType','state','waitType','wait','count'],row)) for row in cursor.fetchall()]
except Exception as error:report.update(failureType=type(error).__name__,sqlstate=getattr(error,'pgcode',None))
pathlib.Path('.impeccable/reconstruction/database-capacity.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
