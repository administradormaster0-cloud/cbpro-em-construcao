import json,pathlib,time,psycopg2
config=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'))
config['dbname']=config.pop('database');config.update(connect_timeout=12,application_name='cbpro-stagger-refresh',options='-c statement_timeout=15000')
report={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
try:
 with psycopg2.connect(**config) as connection:
  with connection.cursor() as cursor:
   cursor.execute("select jobid,schedule,command from cron.job where jobname='cbpro-refresh-public-snapshot'")
   rows=cursor.fetchall()
   if len(rows)!=1 or rows[0][1] not in ('*/5 * * * *','2-59/5 * * * *') or rows[0][2]!='SELECT public.cbpro_refresh_public_snapshot();':raise ValueError('Unexpected scheduled job')
   report['previousSchedule']=rows[0][1]
   cursor.execute('select cron.alter_job(%s,schedule := %s)',(rows[0][0],'2-59/5 * * * *'))
   cursor.execute("select schedule,active from cron.job where jobname='cbpro-refresh-public-snapshot'")
   schedule,active=cursor.fetchone()
   if schedule!='2-59/5 * * * *' or not active:raise ValueError('Schedule verification failed')
   report.update(schedule=schedule,active=active)
  connection.commit()
 report['committed']=True
except Exception as error:report.update(failureType=type(error).__name__,sqlstate=getattr(error,'pgcode',None))
pathlib.Path('.impeccable/reconstruction/stagger-public-refresh.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
