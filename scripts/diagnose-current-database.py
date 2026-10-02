import json,pathlib,time,psycopg2
cfg=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');cfg.update(connect_timeout=15,options='-c statement_timeout=12000',application_name='cbpro-current-diagnostic')
r={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
try:
 with psycopg2.connect(**cfg) as c:
  with c.cursor() as q:
   q.execute("select pid,application_name,state,wait_event_type,wait_event,extract(epoch from clock_timestamp()-query_start)::integer,left(query,1600) from pg_stat_activity where datname=current_database() and pid<>pg_backend_pid() and state<>'idle' order by query_start limit 12");r['active']=[dict(zip(['pid','application','state','waitType','wait','seconds','query'],x))for x in q.fetchall()]
   q.execute("select jobid,jobname,active,schedule from cron.job order by jobid");r['jobs']=q.fetchall()
   q.execute("select rolname,rolconfig from pg_roles where rolname in ('authenticator','anon','authenticated','service_role','supabase_auth_admin')");r['roles']=q.fetchall()
except Exception as e:r['failureType']=type(e).__name__
pathlib.Path('.impeccable/reconstruction/current-database-health.json').write_text(json.dumps(r,indent=2,default=str));print(json.dumps(r,default=str))
