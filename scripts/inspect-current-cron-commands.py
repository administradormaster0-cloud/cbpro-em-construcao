import json,pathlib,psycopg2,time
cfg=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');cfg.update(connect_timeout=15,options='-c statement_timeout=10000',application_name='cbpro-cron-command-inspection')
with psycopg2.connect(**cfg) as c:
 with c.cursor() as q:
  q.execute("select jobid,jobname,schedule,command,active from cron.job where jobname in ('cbpro-refresh-rankings','cbpro-refresh-public-snapshot')");r={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'jobs':q.fetchall()}
pathlib.Path('.impeccable/reconstruction/current-cron-commands.json').write_text(json.dumps(r,indent=2));print(json.dumps(r))
