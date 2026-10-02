import json,pathlib,time,psycopg2
config=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'))
config['dbname']=config.pop('database')
config.update(connect_timeout=12,application_name='cbpro-io-context',options='-c statement_timeout=15000')
report={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
try:
 with psycopg2.connect(**config) as connection:
  with connection.cursor() as cursor:
   cursor.execute("select current_setting('block_size'),stats_reset from extensions.pg_stat_statements_info")
   row=cursor.fetchone();report.update(blockSize=int(row[0]),statsReset=str(row[1]))
   cursor.execute("select queryid,calls,temp_blks_read,temp_blks_written,round(mean_exec_time::numeric,2),left(query,1200) from extensions.pg_stat_statements where dbid=(select oid from pg_database where datname=current_database()) order by temp_blks_read+temp_blks_written desc limit 8")
   report['topTemporary']=[dict(zip(['queryid','calls','tempRead','tempWritten','meanMs','query'],[str(v) if i==4 else v for i,v in enumerate(row)])) for row in cursor.fetchall()]
except Exception as error:report.update(failureType=type(error).__name__,sqlstate=getattr(error,'pgcode',None))
pathlib.Path('.impeccable/reconstruction/query-io-context.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report))
