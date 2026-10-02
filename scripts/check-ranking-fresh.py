import json,psycopg2
cfg=json.load(open(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json',encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');c=psycopg2.connect(**cfg);q=c.cursor();q.execute("select pg_get_functiondef('public.fn_rnk_ensure_fresh(text)'::regprocedure)");print(q.fetchone()[0]);c.close()
