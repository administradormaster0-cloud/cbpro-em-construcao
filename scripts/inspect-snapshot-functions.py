import json,psycopg2
cfg=json.load(open(r'D:\FC CLUBS\BACKUP-2026-10-01\private\database-connection.json',encoding='utf-8-sig'));cfg['dbname']=cfg.pop('database');c=psycopg2.connect(**cfg);q=c.cursor()
q.execute("select proname,pg_get_function_arguments(p.oid),pg_get_function_result(p.oid),proretset from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and proname in ('fc_public_select','fn_top_performers_highlight','fn_season_pro_players_icons','fn_recruitment_public_feed','fn_rnk_top_trophies')")
for r in q.fetchall():print(r)
c.close()
