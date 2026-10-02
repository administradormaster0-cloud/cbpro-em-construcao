import json,pathlib,time,psycopg2
root=pathlib.Path('.impeccable/reconstruction')
assert json.loads((root/'ranking-delta-test.json').read_text())['passed'] is True
config=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'))
config['dbname']=config.pop('database');config.update(connect_timeout=12,application_name='cbpro-ranking-delta-install',options='-c statement_timeout=15000')
report={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
try:
 with psycopg2.connect(**config) as connection:
  with connection.cursor() as cursor:
   cursor.execute("select pg_get_functiondef('public.fn_rnk_refresh(text)'::regprocedure)");original=cursor.fetchone()[0]
   expected=(root/'ranking-current-definition.sql').read_text(encoding='utf-8')
   if original!=expected:raise ValueError('Live function changed after inspection')
   (root/'ranking-before-delta.sql').write_text(original,encoding='utf-8')
   candidate=pathlib.Path('supabase/migrations/20261002024000_ranking_delta_cache.sql').read_text(encoding='utf-8')
   cursor.execute(candidate)
   cursor.execute("select pg_get_functiondef('public.fn_rnk_refresh(text)'::regprocedure)");installed=cursor.fetchone()[0]
   assert installed.count('IS DISTINCT FROM EXCLUDED.row')==2
   assert installed.count('AS MATERIALIZED')==2
   report['definitionVerified']=True
  connection.commit()
 report['committed']=True
 # Keep future installs consistent with the guarded live deployment.
 source=pathlib.Path('supabase/cbpro-performance.sql');text=source.read_text(encoding='utf-8')
 start=text.index('CREATE OR REPLACE FUNCTION public.fn_rnk_refresh(p_season_id text)')
 end=text.index('$function$',text.index('$function$',start)+len('$function$'))+len('$function$')+1
 source.write_text(text[:start]+candidate.rstrip()+text[end:],encoding='utf-8')
 report['sourceUpdated']=True
except Exception as error:report.update(failureType=type(error).__name__,sqlstate=getattr(error,'pgcode',None))
(root/'ranking-delta-deployment.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
