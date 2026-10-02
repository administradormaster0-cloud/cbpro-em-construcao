import json,pathlib,time,psycopg2
config=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));config['dbname']=config.pop('database');config.update(connect_timeout=12,application_name='cbpro-highlight-optimization',options='-c statement_timeout=15000')
report={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
try:
 with psycopg2.connect(**config) as connection:
  with connection.cursor() as cursor:
   cursor.execute("select provolatile from pg_proc where oid='public.fc_num(jsonb)'::regprocedure")
   if cursor.fetchone()[0]!='i':raise ValueError('Calculation helper not immutable')
   cursor.execute("select pg_get_functiondef('public.fn_top_performers_highlight()'::regprocedure)");original=cursor.fetchone()[0]
   if original.count('WITH base AS (')!=1:raise ValueError('Unexpected highlight definition')
   updated=original.replace('WITH base AS (','WITH base AS MATERIALIZED (',1)
   pathlib.Path('.impeccable/reconstruction/highlight-before-materialization.sql').write_text(original,encoding='utf-8')
   cursor.execute(updated)
   cursor.execute("select position('WITH base AS MATERIALIZED (' in pg_get_functiondef('public.fn_top_performers_highlight()'::regprocedure))>0")
   report['verified']=cursor.fetchone()[0]
  connection.commit()
 report['scope']='Only evaluation reuse changed. Scoring formulas, filters, tie ordering, grants and cached records retained. Latency and result comparisons pending.'
except Exception as error:report['failureType']=type(error).__name__
pathlib.Path('.impeccable/reconstruction/highlight-materialization.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
