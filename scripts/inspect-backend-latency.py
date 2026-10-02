import json,pathlib,time,psycopg2
cfg=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');cfg.update(connect_timeout=12,options='-c statement_timeout=8000',application_name='cbpro-latency-breakdown')
r={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'scope':'Read-only connection, trivial query and bounded public read timing; no cache or synthetic responses.'};start=time.monotonic()
try:
 c=psycopg2.connect(**cfg);r['connectMs']=round((time.monotonic()-start)*1000);c.autocommit=True
 with c.cursor() as q:
  for name,sql,args in [('trivial','select 1',None),('publicRead',"select public.fc_public_select(%s,%s::jsonb,%s::jsonb,%s,%s)",('games','{"op":"and","children":[]}','[]',1,0)),('activity',"select application_name,state,wait_event_type,wait_event,extract(epoch from clock_timestamp()-query_start)::integer,left(query,180) from pg_stat_activity where datname=current_database() and pid<>pg_backend_pid() and state<>'idle' order by query_start limit 20",None)]:
   start=time.monotonic()
   try:
    q.execute(sql,args);rows=q.fetchall();r[name]={'elapsedMs':round((time.monotonic()-start)*1000),'rows':rows if name=='activity' else len(rows)}
   except Exception as e:r[name]={'elapsedMs':round((time.monotonic()-start)*1000),'failureType':type(e).__name__}
 c.close()
except Exception as e:r['failureType']=type(e).__name__;r['connectMs']=round((time.monotonic()-start)*1000)
pathlib.Path('.impeccable/reconstruction/backend-latency-breakdown.json').write_text(json.dumps(r,indent=2,default=str));print(json.dumps(r,default=str))
