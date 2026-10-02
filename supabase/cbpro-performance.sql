CREATE OR REPLACE FUNCTION public.fc_edge_filter(f jsonb)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE expr text; op text:=f->>'op'; v text:=f->>'value'; result text; child jsonb; items text[]:='{}'; path text;
BEGIN
 IF f ? 'children' THEN
  IF op NOT IN ('and','or') THEN RAISE EXCEPTION 'Invalid group'; END IF;
  FOR child IN SELECT value FROM jsonb_array_elements(f->'children') LOOP items:=array_append(items,public.fc_edge_filter(child)); END LOOP;
  IF cardinality(items)=0 THEN RETURN CASE WHEN op='and' THEN 'true' ELSE 'false' END; END IF;
  RETURN '('||array_to_string(items,' '||upper(op)||' ')||')';
 END IF;
 path:=f->>'key'; IF path !~ '^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)*$' THEN RAISE EXCEPTION 'Invalid field'; END IF;
 expr:=CASE WHEN path='id' THEN 'id' ELSE format('(doc #>> %L::text[])',string_to_array(path,'.')) END;
 IF op='is' THEN result:=CASE WHEN v='null' THEN expr||' IS NULL' ELSE expr||' IS NOT DISTINCT FROM '||quote_literal(v) END;
 ELSIF op='in' THEN
  FOR child IN SELECT value FROM jsonb_array_elements(f->'value') LOOP items:=array_append(items,quote_literal(child#>>'{}')); END LOOP;
  result:=CASE WHEN cardinality(items)=0 THEN 'false' ELSE expr||' IN ('||array_to_string(items,',')||')' END;
 ELSIF op IN ('eq','neq','gt','gte','lt','lte') THEN
  IF op IN ('gt','gte','lt','lte') AND v ~ '^-?[0-9]+(\.[0-9]+)?$' THEN expr:=format('(CASE WHEN %s ~ %L THEN (%s)::numeric ELSE NULL END)',expr,'^-?[0-9]+(\.[0-9]+)?$',expr); END IF;
  result:=expr||CASE op WHEN 'eq' THEN '=' WHEN 'neq' THEN '<>' WHEN 'gt' THEN '>' WHEN 'gte' THEN '>=' WHEN 'lt' THEN '<' ELSE '<=' END||quote_literal(v);
 ELSIF op IN ('like','ilike') THEN result:=expr||' '||upper(op)||' '||quote_literal(replace(v,'*','%'));
 ELSIF op='cs' THEN result:='strpos('||expr||','||quote_literal(v)||')>0';
 ELSE RAISE EXCEPTION 'Invalid operator'; END IF;
 RETURN CASE WHEN coalesce((f->>'negate')::boolean,false) THEN 'NOT ('||result||')' ELSE result END;
END;$function$
;

CREATE OR REPLACE FUNCTION public.fn_rnk_player_season_rows(p_season_id text DEFAULT NULL::text)
 RETURNS SETOF jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
 SET jit TO 'off'
 SET statement_timeout TO '60s'
AS $function$
DECLARE v_key text := coalesce(nullif(p_season_id, ''), '');
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.fc_rnk_cache_meta WHERE season_key = v_key) THEN
    PERFORM public.fn_rnk_refresh(NULLIF(v_key, ''));
  END IF;
  RETURN QUERY SELECT c.row FROM public.fc_rnk_player_cache c WHERE c.season_key = v_key ORDER BY c.player_profile_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_rnk_refresh(p_season_id text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
 SET jit TO 'off'
 SET statement_timeout TO '60s'
AS $function$
DECLARE
  v_key text := coalesce(nullif(p_season_id, ''), '');
  v_count integer;
BEGIN
  IF NOT pg_try_advisory_xact_lock(hashtext('fc_rnk:' || v_key)) THEN
 RETURN (SELECT count(*)::integer FROM public.fc_rnk_player_cache WHERE season_key=v_key);
 END IF;
 IF EXISTS (SELECT 1 FROM public.fc_rnk_cache_meta WHERE season_key=v_key AND refreshed_at>clock_timestamp()-interval '30 seconds') THEN
 RETURN (SELECT count(*)::integer FROM public.fc_rnk_player_cache WHERE season_key=v_key);
 END IF;




  IF v_key <> '' AND NOT EXISTS (
    SELECT 1 FROM public.fc_runtime_records
    WHERE collection = 'ranking_seasons' AND id = v_key
  ) THEN
    DELETE FROM public.fc_rnk_player_cache WHERE season_key=v_key;
    DELETE FROM public.fc_rnk_team_cache WHERE season_key=v_key;
    INSERT INTO public.fc_rnk_cache_meta(season_key, refreshed_at, player_count)
    VALUES (v_key, clock_timestamp(), 0)
    ON CONFLICT (season_key) DO UPDATE SET refreshed_at=EXCLUDED.refreshed_at,player_count=0;
    RETURN 0;
  END IF;

  WITH season AS (
    SELECT doc->>'game_id' AS game_id,
           public.fc_ts(doc->>'starts_at') AS starts_at,
           public.fc_ts(doc->>'ends_at') AS ends_at
    FROM public.fc_runtime_records
    WHERE v_key <> '' AND collection = 'ranking_seasons' AND id = v_key
  ),
  profiles AS (
    SELECT id,
           doc->>'user_id' AS user_id,
           doc->>'handle' AS handle,
           doc->>'platform_handle' AS platform_handle,
           NULLIF(doc->>'photo_object_key', '') AS photo_object_key,
           NULLIF(doc->>'country_id', '') AS country_id,
           NULLIF(doc->>'position', '') AS position,
           NULLIF(doc->>'game_id', '') AS game_id,
           public.fc_num(doc->'cod_position') AS cod_position
    FROM public.fc_runtime_records
    WHERE collection = 'player_profiles'
  ),
  membership AS (
    SELECT DISTINCT ON (doc->>'player_profile_id')
           doc->>'player_profile_id' AS player_profile_id,
           NULLIF(doc->>'team_id', '') AS team_id
    FROM public.fc_runtime_records
    WHERE collection = 'team_players' AND coalesce(doc->>'player_profile_id', '') <> ''
    ORDER BY doc->>'player_profile_id', doc->>'created_at' DESC NULLS LAST, id DESC
  ),
  teams AS (
    SELECT id, doc->>'name' AS name, NULLIF(doc->>'tag', '') AS tag,
           NULLIF(doc->>'emblem_object_key', '') AS emblem
    FROM public.fc_runtime_records WHERE collection = 'teams'
  ),
  games AS (
    SELECT id, doc->>'name' AS name FROM public.fc_runtime_records WHERE collection = 'games'
  ),
  countries AS (
    SELECT id, doc->>'iso2' AS iso2 FROM public.fc_runtime_records WHERE collection = 'countries'
  ),
  users AS (
    SELECT id, NULLIF(doc->>'display_name', '') AS display_name
    FROM public.fc_runtime_records WHERE collection = 'users_profile'
  ),
  dedup AS (
    SELECT DISTINCT ON (s.doc->>'player_profile_id', s.doc->>'internal_match_id')
           s.doc->>'player_profile_id' AS pid,
           NULLIF(s.doc->>'team_id', '') AS team_id,
           NULLIF(s.doc->>'internal_match_id', '') AS mid,
           coalesce(public.fc_num(s.doc->'goals'), 0) AS goals,
           coalesce(public.fc_num(s.doc->'assists'), 0) AS assists,
           coalesce(public.fc_num(s.doc->'shots'), 0) AS shots,
           coalesce(public.fc_num(s.doc->'passes_made'), 0) AS passes,
           coalesce(public.fc_num(s.doc->'tackles_made'), 0) AS tackles,
           public.fc_num(s.doc->'rating') AS rating,
           CASE WHEN s.doc->'mom' IN ('true'::jsonb, '1'::jsonb, '"1"'::jsonb, '"true"'::jsonb) THEN 1 ELSE 0 END AS mvp,
           coalesce(public.fc_num(s.doc#>'{raw_player_json,wins}'), 0) AS raw_wins,
           coalesce(public.fc_num(s.doc#>'{raw_player_json,losses}'), 0) AS raw_losses,
           g.doc->>'status' AS status,
           public.fc_num(g.doc->'score_a') AS score_a,
           public.fc_num(g.doc->'score_b') AS score_b,
           ea.doc->>'team_id' AS team_a,
           eb.doc->>'team_id' AS team_b,
           coalesce(public.fc_ts(g.doc->>'scheduled_at'), public.fc_ts(ms.doc->>'scheduled_at'), public.fc_ts(s.doc->>'created_at')) AS played_at,
           coalesce(NULLIF(tu.doc->>'game_id', ''), pr.game_id) AS game_id
    FROM public.fc_runtime_records s
    JOIN profiles pr ON pr.id = s.doc->>'player_profile_id'
    LEFT JOIN public.fc_runtime_records g
      ON g.collection = 'series_games' AND g.id = s.doc->>'internal_match_id'
    LEFT JOIN public.fc_runtime_records ms
      ON ms.collection = 'match_series' AND ms.id = g.doc->>'series_id'
    LEFT JOIN public.fc_runtime_records stg
      ON stg.collection = 'tournament_stages' AND stg.id = ms.doc->>'stage_id'
    LEFT JOIN public.fc_runtime_records tu
      ON tu.collection = 'tournaments' AND tu.id = stg.doc->>'tournament_id'
    LEFT JOIN public.fc_runtime_records ea
      ON ea.collection = 'entrants' AND ea.id = ms.doc->>'entrant_a_id'
    LEFT JOIN public.fc_runtime_records eb
      ON eb.collection = 'entrants' AND eb.id = ms.doc->>'entrant_b_id'
    WHERE s.collection = 'match_eafc_newgen_player_stats'
      AND coalesce(s.doc->>'player_profile_id', '') <> ''
      AND (
        v_key = ''
        OR EXISTS (
          SELECT 1 FROM season sn
          WHERE sn.game_id IS NOT NULL
            AND coalesce(NULLIF(tu.doc->>'game_id', ''), pr.game_id) = sn.game_id
            AND coalesce(public.fc_ts(g.doc->>'scheduled_at'), public.fc_ts(ms.doc->>'scheduled_at'), public.fc_ts(s.doc->>'created_at')) IS NOT NULL
            AND coalesce(public.fc_ts(g.doc->>'scheduled_at'), public.fc_ts(ms.doc->>'scheduled_at'), public.fc_ts(s.doc->>'created_at')) >= sn.starts_at
            AND coalesce(public.fc_ts(g.doc->>'scheduled_at'), public.fc_ts(ms.doc->>'scheduled_at'), public.fc_ts(s.doc->>'created_at')) <= sn.ends_at
        )
      )
    ORDER BY s.doc->>'player_profile_id', s.doc->>'internal_match_id', s.doc->>'created_at' DESC NULLS LAST, s.id DESC
  ),
  scored AS (
    SELECT d.*,
      CASE
        WHEN d.status IN ('PLAYED', 'FINISHED', 'COMPLETED')
             AND d.score_a IS NOT NULL AND d.score_b IS NOT NULL
             AND (d.team_a = d.team_id OR d.team_b = d.team_id)
        THEN CASE
          WHEN (d.team_a = d.team_id AND d.score_a = d.score_b)
            OR (d.team_a IS DISTINCT FROM d.team_id AND d.team_b = d.team_id AND d.score_b = d.score_a)
          THEN 'draw'
          WHEN (d.team_a = d.team_id AND d.score_a > d.score_b)
            OR (d.team_a IS DISTINCT FROM d.team_id AND d.team_b = d.team_id AND d.score_b > d.score_a)
          THEN 'win'
          ELSE 'loss'
        END
        ELSE 'raw'
      END AS result
    FROM dedup d
  ),
  player_stats AS (
    SELECT pid,
           count(*)::numeric AS matches,
           sum(goals) AS goals,
           sum(assists) AS assists,
           sum(shots) AS shots,
           sum(passes) AS passes,
           sum(tackles) AS tackles,
           sum(mvp) AS mvp,
           sum(CASE WHEN rating IS NOT NULL THEN rating ELSE 0 END) AS rating_sum,
           sum(CASE WHEN rating IS NOT NULL THEN 1 ELSE 0 END) AS rating_count,
           sum(CASE WHEN result = 'win' THEN 1 WHEN result = 'raw' THEN raw_wins ELSE 0 END) AS wins,
           sum(CASE WHEN result = 'draw' THEN 1 ELSE 0 END) AS draws,
           sum(CASE WHEN result = 'loss' THEN 1 WHEN result = 'raw' THEN raw_losses ELSE 0 END) AS losses
    FROM scored
    GROUP BY pid
  ),
  team_stats AS (
    SELECT pid, coalesce(team_id, '') AS team_id,
           count(*)::numeric AS matches,
           sum(goals) AS goals,
           sum(assists) AS assists,
           sum(shots) AS shots,
           sum(passes) AS passes,
           sum(tackles) AS tackles,
           sum(mvp) AS mvp,
           sum(CASE WHEN rating IS NOT NULL THEN rating ELSE 0 END) AS rating_sum,
           sum(CASE WHEN rating IS NOT NULL THEN 1 ELSE 0 END) AS rating_count,
           sum(CASE WHEN result = 'win' THEN 1 WHEN result = 'raw' THEN raw_wins ELSE 0 END) AS wins,
           sum(CASE WHEN result = 'draw' THEN 1 ELSE 0 END) AS draws,
           sum(CASE WHEN result = 'loss' THEN 1 WHEN result = 'raw' THEN raw_losses ELSE 0 END) AS losses
    FROM scored
    GROUP BY pid, coalesce(team_id, '')
  ),
  imported AS (
    SELECT doc->>'player_profile_id' AS pid,
           sum(coalesce(public.fc_num(doc->'total_matches'), 0)) AS matches,
           sum(coalesce(public.fc_num(doc->'total_goals'), 0)) AS goals,
           sum(coalesce(public.fc_num(doc->'total_assists'), 0)) AS assists,
           sum(coalesce(public.fc_num(doc->'total_mvp'), 0)) AS mvp,
           sum(coalesce(public.fc_num(doc->'avg_rating'), 0) * coalesce(public.fc_num(doc->'total_matches'), 0)) AS rating_sum,
           sum(coalesce(public.fc_num(doc->'total_matches'), 0)) AS rating_count
    FROM public.fc_runtime_records
    WHERE collection = 'player_imported_stats'
      AND coalesce(doc->>'player_profile_id', '') <> ''
      AND (v_key = '' OR doc->>'season_id' = v_key)
    GROUP BY 1
  ),
  title_events AS (
    SELECT s.doc->>'player_profile_id' AS pid,
           'tournament:' || t.id AS title_id,
           coalesce(public.fc_ts(t.doc->>'ends_at'), public.fc_ts(t.doc->>'end_date'), public.fc_ts(s.doc->>'created_at')) AS awarded_at,
           NULLIF(t.doc->>'game_id', '') AS game_id,
           NULL::text AS season_id
    FROM public.fc_runtime_records s
    JOIN public.fc_runtime_records t
      ON t.collection = 'tournaments' AND t.id = s.doc->>'tournament_id'
    WHERE s.collection = 'champion_roster_snapshots'
      AND coalesce(s.doc->>'player_profile_id', '') <> ''
    UNION ALL
    SELECT r.doc->>'player_profile_id',
           'manual:' || t.id,
           public.fc_ts(t.doc->>'awarded_at'),
           NULLIF(t.doc->>'game_id', ''),
           NULLIF(t.doc->>'season_id', '')
    FROM public.fc_runtime_records r
    JOIN public.fc_runtime_records t
      ON t.collection = 'manual_titles' AND t.id = r.doc->>'manual_title_id'
    WHERE r.collection = 'manual_title_roster'
      AND coalesce(r.doc->>'player_profile_id', '') <> ''
    UNION ALL
    SELECT NULLIF(t.doc->>'player_profile_id', ''),
           'manual:' || t.id,
           public.fc_ts(t.doc->>'awarded_at'),
           NULLIF(t.doc->>'game_id', ''),
           NULLIF(t.doc->>'season_id', '')
    FROM public.fc_runtime_records t
    WHERE t.collection = 'manual_titles'
      AND coalesce(t.doc->>'player_profile_id', '') <> ''
  ),
  titles AS (
    SELECT e.pid, count(DISTINCT e.title_id)::numeric AS trophies
    FROM title_events e
    WHERE e.pid IS NOT NULL
      AND (e.season_id IS NULL OR v_key = '' OR e.season_id IS NULL OR e.season_id = v_key)
      AND (
        v_key = ''
        OR EXISTS (
          SELECT 1 FROM season sn
          WHERE e.game_id = sn.game_id
            AND e.awarded_at IS NOT NULL
            AND e.awarded_at >= sn.starts_at
            AND e.awarded_at <= sn.ends_at
        )
      )
      AND (v_key = '' OR e.season_id IS NULL OR e.season_id = v_key OR e.title_id LIKE 'tournament:%')
    GROUP BY e.pid
  ),
  ids AS (
    SELECT pid FROM player_stats
    UNION SELECT pid FROM imported
    UNION SELECT pid FROM titles
  ) ,
  desired_players(season_key, player_profile_id, row) AS MATERIALIZED (
  SELECT v_key, pr.id,
         jsonb_build_object(
           'player_profile_id', pr.id,
           'user_id', pr.user_id,
           'handle', pr.handle,
           'display_name', coalesce(u.display_name, pr.handle),
           'platform_handle', pr.platform_handle,
           'photo_object_key', pr.photo_object_key,
           'country_id', pr.country_id,
           'country_iso2', coalesce(c.iso2, ''),
           'cod_position', pr.cod_position,
           'position', pr.position,
           'game_id', pr.game_id,
           'game_name', g.name,
           'plan_key', 'free',
           'team_name', tm.name,
           'team_emblem_key', tm.emblem,
           'matches', coalesce(ps.matches, 0) + coalesce(im.matches, 0),
           'wins', coalesce(ps.wins, 0),
           'draws', coalesce(ps.draws, 0),
           'losses', coalesce(ps.losses, 0),
           'goals', coalesce(ps.goals, 0) + coalesce(im.goals, 0),
           'assists', coalesce(ps.assists, 0) + coalesce(im.assists, 0),
           'mvp', coalesce(ps.mvp, 0) + coalesce(im.mvp, 0),
           'shots', coalesce(ps.shots, 0),
           'passes', coalesce(ps.passes, 0),
           'tackles', coalesce(ps.tackles, 0),
           'rating_sum', coalesce(ps.rating_sum, 0) + coalesce(im.rating_sum, 0),
           'rating_count', coalesce(ps.rating_count, 0) + coalesce(im.rating_count, 0),
           'trophies', coalesce(ti.trophies, 0),
           'avg_rating', CASE
             WHEN coalesce(ps.rating_count, 0) + coalesce(im.rating_count, 0) > 0
             THEN (coalesce(ps.rating_sum, 0) + coalesce(im.rating_sum, 0))
                  / (coalesce(ps.rating_count, 0) + coalesce(im.rating_count, 0))
             ELSE 0 END
         )
  FROM ids
  JOIN profiles pr ON pr.id = ids.pid
  LEFT JOIN player_stats ps ON ps.pid = pr.id
  LEFT JOIN imported im ON im.pid = pr.id
  LEFT JOIN titles ti ON ti.pid = pr.id
  LEFT JOIN membership mb ON mb.player_profile_id = pr.id
  LEFT JOIN teams tm ON tm.id = mb.team_id
  LEFT JOIN games g ON g.id = pr.game_id
  LEFT JOIN countries c ON c.id = pr.country_id
  LEFT JOIN users u ON u.id = pr.user_id
  ),
  ins_players AS (
    INSERT INTO public.fc_rnk_player_cache AS c(season_key, player_profile_id, row)
    SELECT season_key, player_profile_id, row FROM desired_players
    ON CONFLICT (season_key, player_profile_id) DO UPDATE SET row=EXCLUDED.row
    WHERE c.row IS DISTINCT FROM EXCLUDED.row
    RETURNING 1
  ),
  del_players AS (
    DELETE FROM public.fc_rnk_player_cache c WHERE c.season_key=v_key
    AND NOT EXISTS (SELECT 1 FROM desired_players d WHERE d.season_key=c.season_key AND d.player_profile_id=c.player_profile_id)
    RETURNING 1
  ),

  desired_teams(season_key, player_profile_id, team_id, row) AS MATERIALIZED (
  SELECT v_key, ts.pid, ts.team_id,
         jsonb_build_object(
           'teamId', NULLIF(ts.team_id, ''),
           'teamName', tm.name,
           'teamTag', tm.tag,
           'teamEmblemKey', tm.emblem,
           'team_id', NULLIF(ts.team_id, ''),
           'team_name', tm.name,
           'team_emblem_key', tm.emblem,
           'player_profile_id', ts.pid,
           'matches', ts.matches,
           'wins', ts.wins,
           'draws', ts.draws,
           'losses', ts.losses,
           'goals', ts.goals,
           'assists', ts.assists,
           'mvp', ts.mvp,
           'shots', ts.shots,
           'passes', ts.passes,
           'tackles', ts.tackles,
           'rating_sum', ts.rating_sum,
           'rating_count', ts.rating_count,
           'avg_rating', CASE WHEN ts.rating_count > 0 THEN ts.rating_sum / ts.rating_count ELSE 0 END,
           'stats', jsonb_build_object(
             'goals', ts.goals,
             'assists', ts.assists,
             'rating', CASE WHEN ts.rating_count > 0 THEN round(ts.rating_sum / ts.rating_count, 2) ELSE 0 END,
             'matches', ts.matches
           )
         )
  FROM team_stats ts
  LEFT JOIN teams tm ON tm.id = NULLIF(ts.team_id, '')
  ),
  ins_teams AS (
    INSERT INTO public.fc_rnk_team_cache AS c(season_key, player_profile_id, team_id, row)
    SELECT season_key, player_profile_id, team_id, row FROM desired_teams
    ON CONFLICT (season_key, player_profile_id, team_id) DO UPDATE SET row=EXCLUDED.row
    WHERE c.row IS DISTINCT FROM EXCLUDED.row
    RETURNING 1
  ),
  del_teams AS (
    DELETE FROM public.fc_rnk_team_cache c WHERE c.season_key=v_key
    AND NOT EXISTS (SELECT 1 FROM desired_teams d WHERE d.season_key=c.season_key AND d.player_profile_id=c.player_profile_id AND d.team_id=c.team_id)
    RETURNING 1
  )
  SELECT p.c INTO v_count
  FROM (SELECT count(*) AS c FROM desired_players) p
  CROSS JOIN (SELECT count(*) AS c FROM desired_teams) t;

  INSERT INTO public.fc_rnk_cache_meta(season_key, refreshed_at, player_count)
  VALUES (v_key, clock_timestamp(), coalesce(v_count, 0))
  ON CONFLICT (season_key) DO UPDATE SET refreshed_at=EXCLUDED.refreshed_at,player_count=EXCLUDED.player_count;
  RETURN coalesce(v_count, 0);
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_season_pro_players_icons(p_season_id text DEFAULT NULL::text, p_country_id text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
 SET jit TO 'off'
 SET statement_timeout TO '60s'
AS $function$
DECLARE v_key text := coalesce(nullif(p_season_id, ''), ''); result jsonb;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.fc_rnk_cache_meta WHERE season_key = v_key) THEN
    PERFORM public.fn_rnk_refresh(NULLIF(v_key, ''));
  END IF;
  WITH rows AS (
    SELECT c.row,
      CASE WHEN public.fc_num(c.row->'cod_position') = 1 THEN 'GK'
           WHEN public.fc_num(c.row->'cod_position') BETWEEN 2 AND 6 THEN 'DEF'
           WHEN public.fc_num(c.row->'cod_position') BETWEEN 8 AND 12 THEN 'MID'
           ELSE 'ATK' END AS cat
    FROM public.fc_rnk_player_cache c
    WHERE c.season_key = v_key
      AND coalesce(public.fc_num(c.row->'matches'), 0) >= 5
      AND (p_country_id IS NULL OR c.row->>'country_id' = p_country_id)
  ), metrics AS (
    SELECT * FROM (VALUES
      ('ATK','goals'),('ATK','trophies'),('ATK','assists'),
      ('MID','assists'),('MID','tackles'),('MID','trophies'),
      ('DEF','tackles'),('DEF','trophies'),('DEF','mvp'),
      ('GK','trophies'),('GK','mvp')
    ) AS v(cat, metric)
  ), ranked AS (
    SELECT r.row, m.cat, m.metric, public.fc_num(r.row->m.metric) AS value,
      row_number() OVER (PARTITION BY m.cat, m.metric ORDER BY public.fc_num(r.row->m.metric) DESC, r.row->>'player_profile_id') AS rn
    FROM rows r JOIN metrics m ON m.cat = r.cat
    WHERE coalesce(public.fc_num(r.row->m.metric), 0) > 0
  )
  SELECT coalesce(jsonb_agg((row || jsonb_build_object('category', cat, 'metric', metric, 'value', value)) ORDER BY cat, metric, rn), '[]'::jsonb)
  INTO result FROM ranked WHERE rn <= 2;
  RETURN coalesce(result, '[]'::jsonb);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_top_performer_career(p_player_profile_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
 SET jit TO 'off'
 SET statement_timeout TO '60s'
AS $function$
DECLARE v_career jsonb; v_teams jsonb;
BEGIN
  IF p_player_profile_id IS NULL OR btrim(p_player_profile_id) = '' THEN
    RETURN jsonb_build_object('career', NULL, 'teams', '[]'::jsonb);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.fc_rnk_cache_meta WHERE season_key = '') THEN
    PERFORM public.fn_rnk_refresh(NULL);
  END IF;
  SELECT c.row || jsonb_build_object(
    'rating', round(coalesce(public.fc_num(c.row->'avg_rating'), 0), 2),
    'goals', coalesce(public.fc_num(c.row->'goals'), 0),
    'assists', coalesce(public.fc_num(c.row->'assists'), 0),
    'mvp', coalesce(public.fc_num(c.row->'mvp'), 0),
    'shots', coalesce(public.fc_num(c.row->'shots'), 0),
    'passes', coalesce(public.fc_num(c.row->'passes'), 0),
    'tackles', coalesce(public.fc_num(c.row->'tackles'), 0)
  ) INTO v_career
  FROM public.fc_rnk_player_cache c
  WHERE c.season_key = '' AND c.player_profile_id = p_player_profile_id;
  SELECT coalesce(jsonb_agg(t.row ORDER BY public.fc_num(t.row->'matches') DESC NULLS LAST, t.team_id), '[]'::jsonb)
  INTO v_teams FROM public.fc_rnk_team_cache t
  WHERE t.season_key = '' AND t.player_profile_id = p_player_profile_id;
  RETURN jsonb_build_object('career', v_career, 'teams', coalesce(v_teams, '[]'::jsonb));
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_top_performers_highlight()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
 SET jit TO 'off'
 SET statement_timeout TO '60s'
AS $function$
DECLARE result jsonb;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.fc_rnk_cache_meta
    WHERE season_key = '' 
  ) THEN
    PERFORM public.fn_rnk_refresh(NULL);
  END IF;
  WITH base AS MATERIALIZED (
    SELECT c.player_profile_id AS cache_player_id, c.row->>'player_profile_id' AS tie_player_id,
      CASE WHEN public.fc_num(c.row->'cod_position') = 1 THEN 'GK'
           WHEN public.fc_num(c.row->'cod_position') BETWEEN 2 AND 6 THEN 'DEF'
           WHEN public.fc_num(c.row->'cod_position') BETWEEN 8 AND 12 THEN 'MID'
           ELSE 'ATK' END AS pos_category,
      public.fc_num(c.row->'matches') AS matches,
      public.fc_num(c.row->'wins') AS wins,
      public.fc_num(c.row->'goals') AS goals,
      public.fc_num(c.row->'assists') AS assists,
      public.fc_num(c.row->'mvp') AS mvp,
      public.fc_num(c.row->'shots') AS shots,
      public.fc_num(c.row->'passes') AS passes,
      public.fc_num(c.row->'tackles') AS tackles,
      public.fc_num(c.row->'avg_rating') AS rating
    FROM public.fc_rnk_player_cache c
    WHERE c.season_key = '' AND coalesce(public.fc_num(c.row->'matches'), 0) >= 5
  ), scored AS MATERIALIZED (
    SELECT b.*,
      (CASE b.pos_category
        WHEN 'ATK' THEN rating*6 + goals*7 + assists*4 + mvp*5 + (CASE WHEN matches > 0 THEN wins / matches * 100 ELSE 0 END)*3 + (CASE WHEN shots > 0 THEN goals / shots ELSE 0 END)*10 + wins*2
        WHEN 'MID' THEN rating*6 + assists*6 + goals*4 + passes*0.05 + tackles*2 + mvp*4 + (CASE WHEN matches > 0 THEN wins / matches * 100 ELSE 0 END)*3
        WHEN 'DEF' THEN rating*7 + tackles*4 + (CASE WHEN matches > 0 THEN wins / matches * 100 ELSE 0 END)*4 + mvp*5 + passes*0.03
        ELSE rating*8 + (CASE WHEN matches > 0 THEN wins / matches * 100 ELSE 0 END)*5 + mvp*6 + passes*0.02
      END) / NULLIF(matches, 0) AS score_per_match
    FROM base b
  ), best AS (
    SELECT DISTINCT ON (pos_category) * FROM scored
    WHERE score_per_match IS NOT NULL
    ORDER BY pos_category, score_per_match DESC, tie_player_id
  )
  SELECT coalesce(jsonb_agg((c.row || jsonb_build_object('pos_category', best.pos_category, 'score_per_match', best.score_per_match)) ORDER BY best.pos_category), '[]'::jsonb)
  INTO result FROM best JOIN public.fc_rnk_player_cache c ON c.season_key = '' AND c.player_profile_id = best.cache_player_id;
  RETURN coalesce(result, '[]'::jsonb);
END;
$function$


CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

CREATE OR REPLACE FUNCTION public.cbpro_refresh_rankings() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public SET statement_timeout='120s' AS $fn$
DECLARE k text;
BEGIN
 FOR k IN SELECT m.season_key FROM public.fc_rnk_cache_meta m WHERE m.refreshed_at<clock_timestamp()-interval '10 minutes'
 AND (m.season_key='' OR EXISTS(SELECT 1 FROM public.fc_runtime_records r WHERE r.collection='ranking_seasons' AND r.id=m.season_key AND (r.doc->>'ends_at' IS NULL OR public.fc_ts(r.doc->>'ends_at')>=now()-interval '7 days')))
 LOOP PERFORM public.fn_rnk_refresh(nullif(k,'')); END LOOP;
END;$fn$;
REVOKE ALL ON FUNCTION public.cbpro_refresh_rankings() FROM PUBLIC,anon,authenticated;
SELECT cron.schedule('cbpro-refresh-rankings','*/5 * * * *','SELECT public.cbpro_refresh_rankings();');
