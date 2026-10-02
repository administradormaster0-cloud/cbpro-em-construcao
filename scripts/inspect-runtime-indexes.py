import json,pathlib,time,psycopg2
cfg=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');cfg.update(connect_timeout=12,options='-c statement_timeout=12000',application_name='cbpro-runtime-index-inspection')
r={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
try:
 with psycopg2.connect(**cfg) as c:
  with c.cursor() as q:
   q.execute("select indexname,indexdef from pg_indexes where schemaname='public' and tablename='fc_runtime_records'");r['indexes']=q.fetchall()
   q.execute("select collection,count(*) from public.fc_runtime_records group by collection order by count(*) desc limit 10");r['collections']=q.fetchall()
   q.execute("select wait_event_type,wait_event,state,count(*) from pg_stat_activity where datname=current_database() group by 1,2,3");r['activity']=q.fetchall()
except Exception as e:r['failureType']=type(e).__name__
pathlib.Path('.impeccable/reconstruction/runtime-index-inspection.json').write_text(json.dumps(r,indent=2,default=str));print(json.dumps(r,default=str))
