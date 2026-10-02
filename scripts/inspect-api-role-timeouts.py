import json,pathlib,time,psycopg2
cfg=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');cfg.update(connect_timeout=12,options='-c statement_timeout=8000',application_name='cbpro-timeout-preflight');r={}
with psycopg2.connect(**cfg) as c:
 with c.cursor() as q:
  q.execute("select rolname,rolconfig from pg_roles where rolname in ('authenticator','anon','authenticated','service_role')");r['roles']=q.fetchall()
pathlib.Path('.impeccable/reconstruction/api-timeout-before.json').write_text(json.dumps(r,indent=2));print(json.dumps(r))
