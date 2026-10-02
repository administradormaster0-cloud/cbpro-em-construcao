import json,pathlib,psycopg2,time
cfg=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');cfg.update(connect_timeout=15,options='-c statement_timeout=12000',application_name='cbpro-bound-refresh-jobs')
r={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
with psycopg2.connect(**cfg) as c:
 with c.cursor() as q:
  q.execute("select jobid,jobname,schedule,command,active from cron.job where jobname in ('cbpro-refresh-rankings','cbpro-refresh-public-snapshot') order by jobid");before=q.fetchall();r['before']=before
  assert len(before)==2
  for jobid,name,schedule,command,active in before:
   fn='cbpro_refresh_rankings' if name=='cbpro-refresh-rankings' else 'cbpro_refresh_public_snapshot'
   assert command=='SELECT public.'+fn+'();' and active
   new="SET statement_timeout = '90s'; SELECT public."+fn+"() WHERE pg_try_advisory_lock(20261002,1); SELECT pg_advisory_unlock(20261002,1);"
   q.execute('select cron.alter_job(%s,command := %s)',(jobid,new))
  q.execute("select jobid,jobname,schedule,command,active from cron.job where jobname in ('cbpro-refresh-rankings','cbpro-refresh-public-snapshot') order by jobid");r['after']=q.fetchall()
pathlib.Path('.impeccable/reconstruction/bounded-refresh-jobs.json').write_text(json.dumps(r,indent=2));print(json.dumps(r))
