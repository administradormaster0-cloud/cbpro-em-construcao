import json,pathlib,time,psycopg2
cfg=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');cfg.update(connect_timeout=12,options='-c statement_timeout=12000',application_name='cbpro-protect-avatar-offers')
report={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'applied':False,'publicReadDenied':False}
try:
 with psycopg2.connect(**cfg) as c:
  with c.cursor() as q:
   q.execute("select pg_get_functiondef('public.fc_public_select(text,jsonb,jsonb,integer,integer)'::regprocedure)");before=q.fetchone()[0]
   pathlib.Path('.impeccable/reconstruction/public-select-before-avatar-privacy.sql').write_text(before)
   after=before
   if "'avatar_offers'" not in before:
    assert "'fc_audit','fc_system_reports'" in before
    after=before.replace("'fc_audit','fc_system_reports'","'avatar_offers','fc_audit','fc_system_reports'",1)
    q.execute(after)
   c.commit();report['applied']=True
   q.execute("select pg_get_functiondef('public.fc_public_select(text,jsonb,jsonb,integer,integer)'::regprocedure)");report['sourceVerified']=q.fetchone()[0]==after
   try:q.execute("select public.fc_public_select('avatar_offers')")
   except psycopg2.Error as e:
    report['denialCode']=e.pgcode;report['publicReadDenied']=e.pgcode=='42501';c.rollback()
except Exception as e:report['failure']=type(e).__name__
pathlib.Path('.impeccable/reconstruction/avatar-offer-public-privacy.json').write_text(json.dumps(report,indent=2));print(json.dumps(report),flush=True)
