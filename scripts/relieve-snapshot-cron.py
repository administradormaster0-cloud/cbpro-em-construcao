import json,pathlib,time,psycopg2
config=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'))
config['dbname']=config.pop('database');config['connect_timeout']=12;config['application_name']='cbpro-snapshot-relief';config['options']='-c statement_timeout=15000'
report={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
try:
 with psycopg2.connect(**config) as connection:
  with connection.cursor() as cursor:
   cursor.execute("select jobid,schedule,command from cron.job where jobname='cbpro-refresh-public-snapshot'")
   row=cursor.fetchone()
   if not row or row[2].strip()!='SELECT public.cbpro_refresh_public_snapshot();':raise ValueError('Unexpected scheduled task')
   report['before']={'jobid':row[0],'schedule':row[1],'command':row[2]}
   pathlib.Path('.impeccable/reconstruction/snapshot-cron-before-relief.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
   cursor.execute('select cron.alter_job(%s,schedule := %s)',(row[0],'*/5 * * * *'))
 connection.commit()
 with connection.cursor() as cursor:
  cursor.execute("select pg_cancel_backend(pid) from pg_stat_activity where application_name='pg_cron' and state='active' and trim(query)='SELECT public.cbpro_refresh_public_snapshot();'")
  report['canceledCurrentRefresh']=[row[0] for row in cursor.fetchall()]
  cursor.execute("select schedule,active from cron.job where jobname='cbpro-refresh-public-snapshot'")
  row=cursor.fetchone();report['after']={'schedule':row[0],'active':row[1]}
 connection.commit();connection.close()
except Exception as error:report['failureType']=type(error).__name__
pathlib.Path('.impeccable/reconstruction/snapshot-cron-relief.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
