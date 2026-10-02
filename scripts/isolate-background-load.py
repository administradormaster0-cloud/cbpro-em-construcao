import json,pathlib,time,psycopg2,urllib.request,urllib.error
cfg=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');cfg.update(connect_timeout=15,options='-c statement_timeout=12000',application_name='cbpro-isolate-background-load')
env=dict(line.split('=',1) for line in pathlib.Path('.env.supabase.local').read_text().splitlines() if '=' in line and not line.startswith('#'));env={k:v.strip().strip('\"\'') for k,v in env.items()}
r={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'scope':'Temporarily disable only CBPRO refresh jobs and restore in finally; read-only endpoint probes','samples':[]};out=pathlib.Path('.impeccable/reconstruction/background-load-isolation.json');jobs=[]
try:
 with psycopg2.connect(**cfg) as c:
  c.autocommit=True
  with c.cursor() as q:
   q.execute("select jobid,jobname,active from cron.job where jobname in ('cbpro-refresh-rankings','cbpro-refresh-public-snapshot') order by jobid");jobs=q.fetchall();assert len(jobs)==2;r['jobsBefore']=jobs;out.write_text(json.dumps(r,indent=2))
   for jobid,name,active in jobs:q.execute('select cron.alter_job(%s,active := false)',(jobid,))
   q.execute("select pg_cancel_backend(pid) from pg_stat_activity where application_name='pg_cron' and state='active' and (query like '%SELECT public.cbpro_refresh_rankings();%' or query like '%SELECT public.cbpro_refresh_public_snapshot();%' or query like '%SELECT public.cbpro_refresh_rankings() WHERE pg_try_advisory_lock%' or query like '%SELECT public.cbpro_refresh_public_snapshot() WHERE pg_try_advisory_lock%')");r['cancelled']=q.fetchall();out.write_text(json.dumps(r,indent=2));print('CBPRO background jobs temporarily disabled.',flush=True)
 for name,path in [('authHealth','/auth/v1/health'),('minimalRead','/rest/v1/fc_runtime_records?select=id&collection=eq.games&limit=1'),('snapshot','/rest/v1/rpc/cbpro_get_public_snapshot?p_route=home')]:
  start=time.monotonic()
  try:
   req=urllib.request.Request(env['SUPABASE_URL']+path,headers={'apikey':env['SUPABASE_ANON_KEY'],'Authorization':'Bearer '+env['SUPABASE_ANON_KEY']})
   with urllib.request.urlopen(req,timeout=15) as response:response.read();status=response.status
   r['samples'].append({'name':name,'status':status,'ms':round((time.monotonic()-start)*1000)})
  except Exception as e:r['samples'].append({'name':name,'failure':type(e).__name__,'ms':round((time.monotonic()-start)*1000)})
  out.write_text(json.dumps(r,indent=2));print(json.dumps(r['samples'][-1]),flush=True)
except Exception as e:r['failure']=type(e).__name__
finally:
 if jobs:
  try:
   with psycopg2.connect(**cfg) as c:
    with c.cursor() as q:
     for jobid,name,active in jobs:q.execute('select cron.alter_job(%s,active := %s)',(jobid,active))
     q.execute("select jobid,jobname,active from cron.job where jobname in ('cbpro-refresh-rankings','cbpro-refresh-public-snapshot') order by jobid");r['jobsAfter']=q.fetchall();r['restored']=r['jobsAfter']==jobs
  except Exception as e:r['restoreFailure']=type(e).__name__
 out.write_text(json.dumps(r,indent=2));print(json.dumps(r),flush=True)
