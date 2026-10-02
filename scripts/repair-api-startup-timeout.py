import json,pathlib,time,psycopg2
cfg=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');cfg.update(connect_timeout=12,options='-c statement_timeout=10000',application_name='cbpro-schema-startup-repair')
r={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'purpose':'Allow internal schema startup60seconds, preserving anon3s/authenticated8s and inherited service8s; no data changes'}
try:
 with psycopg2.connect(**cfg) as c:
  with c.cursor() as q:
   q.execute("ALTER ROLE service_role SET statement_timeout = '8s'")
   q.execute("ALTER ROLE authenticator SET statement_timeout = '60s'")
   q.execute("NOTIFY pgrst, 'reload config'")
   q.execute("NOTIFY pgrst, 'reload schema'")
   q.execute("select rolname,rolconfig from pg_roles where rolname in ('authenticator','anon','authenticated','service_role')");r['roles']=q.fetchall()
 r['committed']=True
except Exception as e:r['failureType']=type(e).__name__
pathlib.Path('.impeccable/reconstruction/api-startup-repair.json').write_text(json.dumps(r,indent=2));print(json.dumps(r))
pathlib.Path('.impeccable/reconstruction/api-startup-repair-rollback.sql').write_text("BEGIN;\nALTER ROLE authenticator SET statement_timeout='8s';\nALTER ROLE service_role RESET statement_timeout;\nNOTIFY pgrst, 'reload config';\nNOTIFY pgrst, 'reload schema';\nCOMMIT;\n")
