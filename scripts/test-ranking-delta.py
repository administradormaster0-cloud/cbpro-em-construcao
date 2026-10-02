import json,pathlib,time,psycopg2
config=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'))
config['dbname']=config.pop('database');config.update(connect_timeout=12,application_name='cbpro-delta-cache-test',options='-c statement_timeout=15000')
report={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'scope':'Temporary test records only, transaction rolled back; full ranking result and latency validation pending.'}
try:
 connection=psycopg2.connect(**config)
 try:
  with connection.cursor() as cursor:
   cursor.execute("CREATE TEMP TABLE cbpro_delta_test(season_key text,player_profile_id text,row jsonb,PRIMARY KEY(season_key,player_profile_id)) ON COMMIT DROP")
   cursor.execute("INSERT INTO cbpro_delta_test VALUES ('a','changed','{\"goals\":1}'),('a','same','{\"goals\":2}'),('a','removed','{\"goals\":3}'),('b','other-season','{\"goals\":9}')")
   sql="""WITH desired(season_key,player_profile_id,row) AS MATERIALIZED (VALUES ('a','changed','{"goals":4}'::jsonb),('a','same','{"goals":2}'::jsonb),('a','new','{"goals":5}'::jsonb)),ins AS (INSERT INTO cbpro_delta_test AS c SELECT * FROM desired ON CONFLICT(season_key,player_profile_id) DO UPDATE SET row=EXCLUDED.row WHERE c.row IS DISTINCT FROM EXCLUDED.row RETURNING 1),del AS (DELETE FROM cbpro_delta_test c WHERE season_key='a' AND NOT EXISTS(SELECT 1 FROM desired d WHERE d.season_key=c.season_key AND d.player_profile_id=c.player_profile_id) RETURNING 1) SELECT (SELECT count(*) FROM desired),(SELECT count(*) FROM ins),(SELECT count(*) FROM del)"""
   cursor.execute(sql);first=cursor.fetchone();assert first==(3,2,1),first
   cursor.execute(sql);second=cursor.fetchone();assert second==(3,0,0),second
   cursor.execute("select player_profile_id,row from cbpro_delta_test order by player_profile_id")
   rows=dict(cursor.fetchall());assert rows=={'changed':{'goals':4},'same':{'goals':2},'new':{'goals':5},'other-season':{'goals':9}},rows
   candidate=pathlib.Path('supabase/migrations/20261002024000_ranking_delta_cache.sql').read_text(encoding='utf-8').replace('public.fn_rnk_refresh(p_season_id text)','pg_temp.cbpro_candidate_refresh(p_season_id text)',1)
   cursor.execute(candidate)
   report.update(firstPass=dict(zip(['resultCount','written','removed'],first)),repeatPass=dict(zip(['resultCount','written','removed'],second)),otherSeasonPreserved=True,candidateDefinitionAccepted=True,passed=True)
 finally:connection.rollback();connection.close()
except Exception as error:report.update(failureType=type(error).__name__,sqlstate=getattr(error,'pgcode',None))
pathlib.Path('.impeccable/reconstruction/ranking-delta-test.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
