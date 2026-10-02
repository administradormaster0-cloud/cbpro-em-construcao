import json,pathlib,time,psycopg2
config=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));config['dbname']=config.pop('database');config.update(connect_timeout=12,application_name='cbpro-catalogue-cost',options='-c statement_timeout=10000')
report={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
try:
 with psycopg2.connect(**config) as connection:
  with connection.cursor() as cursor:
   cursor.execute("select current_setting('jit'),current_setting('jit_above_cost'),current_setting('default_transaction_read_only')");row=cursor.fetchone();report['settings']={'jit':row[0],'jit_above_cost':row[1],'readOnly':row[2]}
   cursor.execute("select relname,n_live_tup,n_dead_tup,last_analyze::text,last_autoanalyze::text from pg_stat_sys_tables where relname in ('pg_class','pg_attribute','pg_proc','pg_type') order by relname");report['catalogueStats']=[{'name':r[0],'live':r[1],'dead':r[2],'analyzed':r[3],'autoanalyzed':r[4]} for r in cursor.fetchall()]
except Exception as error:report.update(failureType=type(error).__name__,sqlstate=getattr(error,'pgcode',None))
pathlib.Path('.impeccable/reconstruction/catalogue-cost-diagnostic.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
