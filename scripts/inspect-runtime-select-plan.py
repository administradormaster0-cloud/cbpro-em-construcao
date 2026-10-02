import json,pathlib,time,psycopg2
cfg=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');cfg.update(connect_timeout=12,options='-c statement_timeout=10000',application_name='cbpro-select-plan')
r={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'scope':'EXPLAIN only; does not measure execution latency'}
try:
 with psycopg2.connect(**cfg) as c:
  with c.cursor() as q:
   q.execute("EXPLAIN (FORMAT JSON) SELECT coalesce(jsonb_agg(doc),'[]'::jsonb) FROM (SELECT doc FROM public.fc_runtime_records WHERE collection=%s AND id IN (%s,%s) LIMIT 1000) x",('teams','a645a63a-0002-497f-9b90-2f1441c53685','bdd25d21-55eb-49c6-9ef8-f124961d8105'));r['plan']=q.fetchone()[0]
except Exception as e:r['failureType']=type(e).__name__
pathlib.Path('.impeccable/reconstruction/runtime-select-plan.json').write_text(json.dumps(r,indent=2));print(json.dumps(r))
