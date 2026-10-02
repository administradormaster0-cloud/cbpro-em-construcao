import json,pathlib,time,psycopg2
cfg=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');cfg.update(connect_timeout=15,options='-c statement_timeout=10000',application_name='cbpro-query-isolation')
r={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'queries':[]}
with psycopg2.connect(**cfg) as c:
 for name,sql in [('ping','select 1'),('games',"select id from public.fc_runtime_records where collection='games' limit 1"),('snapshots',"select route,refreshed_at from public.cbpro_public_route_snapshots"),('functions',"select proname,proconfig from pg_proc where proname in ('fc_public_select','cbpro_get_public_snapshot','fc_admin_select')"),('fixture',"select id from auth.users where email='cbproqa1790924232670@example.invalid'")]:
  start=time.monotonic()
  try:
   with c.cursor() as q:q.execute(sql);data=q.fetchall()
   r['queries'].append({'name':name,'ms':round((time.monotonic()-start)*1000),'data':data})
  except Exception as e:c.rollback();r['queries'].append({'name':name,'ms':round((time.monotonic()-start)*1000),'failure':type(e).__name__,'sqlstate':getattr(e,'pgcode',None)})
pathlib.Path('.impeccable/reconstruction/direct-query-isolation.json').write_text(json.dumps(r,indent=2,default=str));print(json.dumps(r,default=str))
