import json,pathlib,time,psycopg2
cfg=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');cfg.update(connect_timeout=12,options='-c statement_timeout=8000',application_name='cbpro-public-function-inspection')
r={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
try:
 with psycopg2.connect(**cfg) as c:
  with c.cursor() as q:
   q.execute("select pg_get_functiondef('public.fc_public_select(text,jsonb,jsonb,integer,integer)'::regprocedure)");s=q.fetchone()[0];pathlib.Path('.impeccable/reconstruction/public-select-current.sql').write_text(s);r['definitionSaved']=True;r['bytes']=len(s);print(s)
except Exception as e:r['failureType']=type(e).__name__
pathlib.Path('.impeccable/reconstruction/public-function-inspection.json').write_text(json.dumps(r,indent=2));print(json.dumps(r))
