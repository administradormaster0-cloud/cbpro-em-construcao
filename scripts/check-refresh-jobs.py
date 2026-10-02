import json,pathlib,time,psycopg2
config=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));config['dbname']=config.pop('database');config.update(connect_timeout=12,application_name='cbpro-refresh-verification',options='-c statement_timeout=12000')
report={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
try:
 with psycopg2.connect(**config) as connection:
  with connection.cursor() as cursor:
   cursor.execute("select j.jobname,r.status,r.start_time::text,extract(epoch from r.end_time-r.start_time),left(r.return_message,250) from cron.job j cross join lateral(select * from cron.job_run_details where jobid=j.jobid order by runid desc limit 3)r where j.jobname in ('cbpro-refresh-rankings','cbpro-refresh-public-snapshot')")
   report['runs']=[dict(zip(['job','status','started','seconds','message'],[str(v) if i==3 else v for i,v in enumerate(row)])) for row in cursor.fetchall()]
except Exception as error:report.update(failureType=type(error).__name__,sqlstate=getattr(error,'pgcode',None))
pathlib.Path('.impeccable/reconstruction/refresh-jobs-current.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
