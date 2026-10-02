import json,pathlib,time,psycopg2
config=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));config['dbname']=config.pop('database');config.update(connect_timeout=12,application_name='cbpro-snapshot-verification',options='-c statement_timeout=60000')
report={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'phase':'connecting'}
start=time.perf_counter()
try:
 with psycopg2.connect(**config) as connection:
  report['phase']='refreshing'
  with connection.cursor() as cursor:
   cursor.execute('select public.cbpro_refresh_public_snapshot()');report['refreshElapsedMs']=round((time.perf_counter()-start)*1000);report['phase']='readingSnapshots'
   cursor.execute('select route,refreshed_at::text,jsonb_array_length(payload) entries from public.cbpro_public_route_snapshots order by route');report['routes']=[{'route':r[0],'refreshed_at':r[1],'entries':r[2]} for r in cursor.fetchall()]
  connection.commit();report['phase']='complete'
except Exception as error:report.update(failureType=type(error).__name__,sqlstate=getattr(error,'pgcode',None),elapsedMs=round((time.perf_counter()-start)*1000))
report['scope']='Live background snapshot refresh only; not browser latency or full feature validation.'
pathlib.Path('.impeccable/reconstruction/snapshot-refresh-verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
