import json,pathlib,time,psycopg2
config=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));config['dbname']=config.pop('database');config.update(connect_timeout=12,application_name='cbpro-catalogue-analysis',options='-c statement_timeout=15000')
report={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'tables':[]}
try:
 with psycopg2.connect(**config) as connection:
  with connection.cursor() as cursor:
   for table in ['pg_class','pg_attribute','pg_proc','pg_type']:
    start=time.perf_counter();cursor.execute('ANALYZE pg_catalog.'+table);report['tables'].append({'name':table,'elapsedMs':round((time.perf_counter()-start)*1000)})
   cursor.execute("NOTIFY pgrst, 'reload schema'")
  connection.commit();report['committed']=True
except Exception as error:report.update(failureType=type(error).__name__,sqlstate=getattr(error,'pgcode',None))
report['scope']='Planner statistics maintenance and schema-cache reload notification; no user-record mutation. Public API recovery unproven until subsequent read.'
pathlib.Path('.impeccable/reconstruction/catalogue-analysis.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
