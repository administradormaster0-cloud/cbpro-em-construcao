import json,pathlib,time,psycopg2
config=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'))
config['dbname']=config.pop('database');config['connect_timeout']=12;config['application_name']='cbpro-snapshot-diagnostic';config['options']='-c statement_timeout=10000'
report={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
try:
 with psycopg2.connect(**config) as connection:
  with connection.cursor() as cursor:
   cursor.execute("select status,extract(epoch from end_time-start_time)::numeric(10,2) seconds,left(return_message,160) message from cron.job_run_details where jobid=(select jobid from cron.job where jobname='cbpro-refresh-public-snapshot') order by runid desc limit 8")
   report['runs']=[{'status':row[0],'seconds':str(row[1]),'message':row[2]} for row in cursor.fetchall()]
   cursor.execute('select route,refreshed_at::text,pg_column_size(payload) bytes from public.cbpro_public_route_snapshots order by route')
   report['snapshots']=[{'route':row[0],'refreshed_at':row[1],'bytes':row[2]} for row in cursor.fetchall()]
except Exception as error:
 report['failureType']=type(error).__name__
pathlib.Path('.impeccable/reconstruction/snapshot-cron-diagnostic.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report))
