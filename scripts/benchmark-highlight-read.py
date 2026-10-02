import json,pathlib,time,psycopg2
config=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));config['dbname']=config.pop('database');config.update(connect_timeout=12,application_name='cbpro-highlight-benchmark',options='-c statement_timeout=12000')
report={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
try:
 with psycopg2.connect(**config) as connection:
  with connection.cursor() as cursor:
   start=time.perf_counter();cursor.execute('select public.fn_top_performers_highlight()');rows=cursor.fetchone()[0];report.update(elapsedMs=round((time.perf_counter()-start)*1000),records=len(rows),categories=[r.get('pos_category') for r in rows])
except Exception as error:report.update(failureType=type(error).__name__)
report['scope']='Single live direct SQL measurement; does not measure public API or browser latency.'
pathlib.Path('.impeccable/reconstruction/highlight-live-benchmark.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
