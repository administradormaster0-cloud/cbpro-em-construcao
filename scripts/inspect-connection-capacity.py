import json,pathlib,time,psycopg2
cfg=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');cfg.update(connect_timeout=12,options='-c statement_timeout=8000',application_name='cbpro-connection-capacity');r={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
try:
 with psycopg2.connect(**cfg) as c:
  with c.cursor() as q:
   q.execute("select name,setting,unit from pg_settings where name in ('max_connections','superuser_reserved_connections','shared_buffers','work_mem','jit','statement_timeout')");r['settings']=[dict(zip(['name','value','unit'],x))for x in q.fetchall()]
   q.execute("select application_name,state,wait_event_type,count(*) from pg_stat_activity group by 1,2,3 order by 4 desc");r['connections']=[dict(zip(['application','state','waitType','count'],x))for x in q.fetchall()]
   q.execute("select datname,numbackends,deadlocks,temp_files,temp_bytes,stats_reset::text from pg_stat_database where datname=current_database()");r['database']=dict(zip(['name','connections','deadlocks','tempFiles','tempBytes','statsReset'],q.fetchone()))
except Exception as e:r['failureType']=type(e).__name__
pathlib.Path('.impeccable/reconstruction/backend-connection-capacity.json').write_text(json.dumps(r,indent=2,default=str));print(json.dumps(r,default=str))
