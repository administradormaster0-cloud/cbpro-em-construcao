import json,pathlib,psycopg2,urllib.request,urllib.error
from psycopg2 import sql
env={}
for line in pathlib.Path('.env.supabase.local').read_text(encoding='utf-8-sig').splitlines():
 if '=' in line and not line.startswith('#'):
  k,v=line.split('=',1);env[k]=v.strip().strip('\"').strip("'")
root=env['SUPABASE_URL'];key=env['SUPABASE_SERVICE_ROLE_KEY'];headers={'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json'}
req=urllib.request.Request(root+'/storage/v1/bucket',data=json.dumps({'id':'cbpro-public-cache','name':'cbpro-public-cache','public':True,'allowed_mime_types':['application/json'],'file_size_limit':10485760}).encode(),headers=headers,method='POST')
try:urllib.request.urlopen(req).read()
except urllib.error.HTTPError as e:
 if e.code not in (400,409):raise
cfg=json.load(open(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json',encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');c=psycopg2.connect(**cfg);q=c.cursor();q.execute('CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;');q.execute("select id from vault.secrets where name='cbpro_cache_storage_service_role'");secret=q.fetchone()
if secret:q.execute('select vault.update_secret(%s,%s)',(secret[0],key))
else:q.execute("select vault.create_secret(%s,'cbpro_cache_storage_service_role','Server-only publishing of anonymous public snapshots')",(key,))
s='''CREATE OR REPLACE FUNCTION public.cbpro_publish_public_snapshots() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $fn$
DECLARE secret text; item record;
BEGIN
 SELECT decrypted_secret INTO secret FROM vault.decrypted_secrets WHERE name='cbpro_cache_storage_service_role';
 IF secret IS NULL THEN RAISE EXCEPTION 'Snapshot publisher credential unavailable'; END IF;
 FOR item IN SELECT route,payload,refreshed_at FROM public.cbpro_public_route_snapshots LOOP
 PERFORM net.http_post(url:='''+sql.Literal(root+'/storage/v1/object/cbpro-public-cache/').as_string(c)+'''||item.route||'.json',headers:=jsonb_build_object('apikey',secret,'Authorization','Bearer '||secret,'Content-Type','application/json','x-upsert','true','Cache-Control','max-age=30'),body:=jsonb_build_object('entries',item.payload,'refreshed_at',item.refreshed_at),timeout_milliseconds:=15000);
 END LOOP;
END;$fn$;
REVOKE ALL ON FUNCTION public.cbpro_publish_public_snapshots() FROM PUBLIC,anon,authenticated;
'''
pathlib.Path('supabase/cbpro-public-cache-publisher.sql').write_text(s,encoding='utf-8')
q.execute(s);q.execute("select pg_get_functiondef('public.cbpro_refresh_public_snapshot()'::regprocedure)");definition=q.fetchone()[0];definition=definition.replace(' END LOOP;\nEND;', ' END LOOP;\n PERFORM public.cbpro_publish_public_snapshots();\nEND;');q.execute(definition);q.execute('SELECT public.cbpro_publish_public_snapshots();');c.commit()
q.execute('SELECT route,payload,refreshed_at from cbpro_public_route_snapshots')
for route,payload,refreshed in q.fetchall():
 body=json.dumps({'entries':payload,'refreshed_at':refreshed.isoformat()},ensure_ascii=False,separators=(',',':')).encode();h=headers|{'x-upsert':'true','Cache-Control':'max-age=30'};req=urllib.request.Request(root+'/storage/v1/object/cbpro-public-cache/'+route+'.json',data=body,headers=h,method='POST');r=urllib.request.urlopen(req);print(route,r.status,len(body))
c.close()
