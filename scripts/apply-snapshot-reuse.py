import json,pathlib,time,psycopg2,importlib.util
spec=importlib.util.spec_from_file_location('optimizer','scripts/optimize-snapshot-definition.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
config=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));config['dbname']=config.pop('database');config.update(connect_timeout=12,application_name='cbpro-snapshot-reuse',options='-c statement_timeout=15000')
report={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
try:
 with psycopg2.connect(**config) as connection:
  with connection.cursor() as cursor:
   cursor.execute("select pg_get_functiondef('public.cbpro_refresh_public_snapshot()'::regprocedure)");original=cursor.fetchone()[0]
   updated,changes=module.optimize(original)
   pathlib.Path('.impeccable/reconstruction/snapshot-before-query-reuse.sql').write_text(original,encoding='utf-8')
   cursor.execute(updated)
   cursor.execute("select position('query_results ? query_key' in pg_get_functiondef('public.cbpro_refresh_public_snapshot()'::regprocedure))>0");report['verified']=cursor.fetchone()[0];report.update(changes)
  connection.commit()
 if report.get('verified'):
  for path in ['supabase/cbpro-public-snapshot.sql','scripts/install-public-snapshot.py']:
   file=pathlib.Path(path);text=file.read_text(encoding='utf-8')
   if path.endswith('.sql'):text=module.optimize(text)[0]
   else:
    text=text.replace("queries={route:[x for x in entries if x['name'] in allowed] for route,entries in queries.items()}","queries={route:[x for x in entries if x['name'] in allowed and x.get('args',{}).get('p_collection') not in ('drafts','draft_entries')] for route,entries in queries.items()}")
    text=text.replace('route_entry record;',"route_entry record; query_results jsonb:='{}'::jsonb; query_key text;")
    text=text.replace("BEGIN\n CASE item->>'name'","BEGIN\n query_key:=jsonb_build_array(item->>'name',a)::text;\n IF query_results ? query_key THEN result:=query_results->query_key; ELSE\n CASE item->>'name'")
    text=text.replace('END CASE;\n entries:=','END CASE;\n query_results:=query_results||jsonb_build_object(query_key,result);\n END IF;\n entries:=')
   file.write_text(text,encoding='utf-8')
except Exception as error:report['failureType']=type(error).__name__
report['scope']='Memoization within one refresh only; retained response entries and permissions, removed only retired Draft queries. Refresh completion and live latency pending.'
pathlib.Path('.impeccable/reconstruction/snapshot-query-reuse.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
