import json,pathlib,psycopg2,time
cfg=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');cfg.update(connect_timeout=15,options='-c statement_timeout=10000',application_name='cbpro-cancel-expired-advisor')
with psycopg2.connect(**cfg) as c:
 with c.cursor() as q:
  q.execute("select pid,pg_cancel_backend(pid) from pg_stat_activity where application_name='mgmt-api' and state='active' and query like '%splinter.public_buckets%' and query_start < clock_timestamp()-interval '2 minutes'")
  result={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'scope':'Cancel only timed-out advisor initiated by this validation; no data mutation','cancelled':q.fetchall()}
pathlib.Path('.impeccable/reconstruction/cancel-expired-advisor.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
