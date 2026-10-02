import json,pathlib,time,psycopg2
config=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));config['dbname']=config.pop('database');config.update(connect_timeout=12,application_name='cbpro-query-io-diagnostic',options='-c statement_timeout=15000')
report={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'phase':'connecting'}
try:
 with psycopg2.connect(**config) as connection:
  with connection.cursor() as cursor:
   report['phase']='readingCounters'
   cursor.execute("select queryid,calls,shared_blks_read,shared_blks_written,shared_blks_dirtied,temp_blks_read,temp_blks_written,round(total_exec_time::numeric,2),round(mean_exec_time::numeric,2),left(query,1200) from extensions.pg_stat_statements where dbid=(select oid from pg_database where datname=current_database()) order by shared_blks_read+shared_blks_written desc limit 20")
   report['queries']=[dict(zip(['queryid','calls','sharedRead','sharedWritten','sharedDirtied','tempRead','tempWritten','totalMs','meanMs','query'],[str(value) if index in (7,8) else value for index,value in enumerate(row)])) for row in cursor.fetchall()]
   report['phase']='complete'
except Exception as error:report.update(failureType=type(error).__name__,sqlstate=getattr(error,'pgcode',None))
pathlib.Path('.impeccable/reconstruction/query-io-diagnostic.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
# Query text remains in the local diagnostic; console emits counters only.
print(json.dumps({**report,'queries':[{key:value for key,value in row.items() if key!='query'} for row in report.get('queries',[])]}))
