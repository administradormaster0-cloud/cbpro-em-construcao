import json,pathlib,time,psycopg2
cfg=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');cfg.update(connect_timeout=12,options='-c statement_timeout=8000',application_name='cbpro-load-inspection')
r={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
try:
 with psycopg2.connect(**cfg) as c:
  with c.cursor() as q:
   q.execute("select application_name,state,wait_event_type,wait_event,extract(epoch from clock_timestamp()-query_start)::integer,left(query,180) from pg_stat_activity where datname=current_database() and pid<>pg_backend_pid() and state<>'idle' order by query_start limit 20");r['active']=[dict(zip(['application','state','waitType','wait','seconds','query'],x))for x in q.fetchall()]
except Exception as e:r['failureType']=type(e).__name__
pathlib.Path('.impeccable/reconstruction/backend-active-load.json').write_text(json.dumps(r,indent=2,default=str));print(json.dumps(r,default=str))
