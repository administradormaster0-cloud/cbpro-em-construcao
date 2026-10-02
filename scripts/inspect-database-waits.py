import json,pathlib,time,select,psycopg2
cfg=json.loads(pathlib.Path(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json').read_text(encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');cfg.update(connect_timeout=12,application_name='cbpro-wait-inventory')
report={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'scope':'Bounded read-only aggregate database waits. No query text or personal data.'};c=None
def ready(connection,seconds):
 end=time.monotonic()+seconds
 while True:
  state=connection.poll()
  if state==psycopg2.extensions.POLL_OK:return
  left=end-time.monotonic()
  if left<=0:raise TimeoutError('Wall deadline')
  if state==psycopg2.extensions.POLL_READ:select.select([connection.fileno()],[],[],min(left,1))
  elif state==psycopg2.extensions.POLL_WRITE:select.select([],[connection.fileno()],[],min(left,1))
  else:raise RuntimeError('Unexpected connection poll')
try:
 start=time.monotonic();c=psycopg2.connect(**cfg,async_=True);ready(c,15);report['connectMs']=round((time.monotonic()-start)*1000);q=c.cursor()
 for name,sql in [('waits',"select application_name,backend_type,state,wait_event_type,wait_event,count(*),max(extract(epoch from clock_timestamp()-query_start))::integer from pg_stat_activity where datname=current_database() and pid<>pg_backend_pid() group by 1,2,3,4,5 order by 6 desc limit 20"),('io',"select numbackends,blks_read,blks_hit,temp_files,temp_bytes,blk_read_time,blk_write_time,deadlocks from pg_stat_database where datname=current_database()")]:
  start=time.monotonic();q.execute(sql);ready(c,12);report[name]={'ms':round((time.monotonic()-start)*1000),'rows':q.fetchall()}
except Exception as e:report['failure']=type(e).__name__
finally:
 if c:c.close()
pathlib.Path('.impeccable/reconstruction/database-waits.json').write_text(json.dumps(report,indent=2,default=str));print(json.dumps(report,default=str),flush=True)
