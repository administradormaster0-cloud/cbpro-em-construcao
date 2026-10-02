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
$function$
