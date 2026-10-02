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
