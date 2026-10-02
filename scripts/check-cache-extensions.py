import json,psycopg2
cfg=json.load(open(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json',encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');c=psycopg2.connect(**cfg);q=c.cursor();q.execute("select extname from pg_extension where extname in ('pg_net','supabase_vault')");print(q.fetchall());c.close()
