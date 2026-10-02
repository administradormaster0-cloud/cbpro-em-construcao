import json,pathlib,time,psycopg2
cfg=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');cfg.update(connect_timeout=12,options='-c statement_timeout=8000',application_name='cbpro-games-read-plan');r={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
try:
 with psycopg2.connect(**cfg) as c:
  with c.cursor() as q:
   for key,sql in [('count','EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT count(*) FROM public.fc_runtime_records WHERE collection=\'games\''),('page','EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT doc FROM public.fc_runtime_records WHERE collection=\'games\' LIMIT 1')]:
    q.execute(sql);r[key]=q.fetchone()[0]
except Exception as e:r['failureType']=type(e).__name__
pathlib.Path('.impeccable/reconstruction/games-read-plan.json').write_text(json.dumps(r,indent=2));print(json.dumps(r))
