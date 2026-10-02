BEGIN;
CREATE OR REPLACE FUNCTION public.fc_search_users(p_query text,p_admin boolean DEFAULT false)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=pg_catalog,public AS $$
 SELECT coalesce(jsonb_agg(result),'[]'::jsonb) FROM (
 SELECT jsonb_build_object('user_id',id,'display_name',coalesce(doc->>'display_name',doc->>'full_name',''),'email',CASE WHEN p_admin THEN doc->>'email' ELSE NULL END) result
 FROM public.fc_runtime_records WHERE collection='users_profile' AND
 ((p_admin AND p_query='@@ALL@@') OR (length(p_query) BETWEEN 2 AND 80 AND
 (strpos(lower(coalesce(doc->>'display_name','')),lower(p_query))>0 OR strpos(lower(coalesce(doc->>'full_name','')),lower(p_query))>0 OR (p_admin AND strpos(lower(coalesce(doc->>'email','')),lower(p_query))>0))))
 ORDER BY id LIMIT CASE WHEN p_admin AND p_query='@@ALL@@' THEN 10000 ELSE 20 END
 ) q;
$$;
CREATE OR REPLACE FUNCTION public.fc_search_entrants(p_names jsonb,p_type text DEFAULT 'team',p_game text DEFAULT NULL,p_country text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=pg_catalog,public AS $$
DECLARE target text; candidate text; fields text[]; matched jsonb; found jsonb:='[]'::jsonb; missing jsonb:='[]'::jsonb;
BEGIN
 target:=CASE WHEN p_type='player' THEN 'player_profiles' ELSE 'teams' END;
 fields:=CASE WHEN p_type='player' THEN ARRAY['handle','platform_handle'] ELSE ARRAY['name','tag','eafc_club_name'] END;
 IF jsonb_typeof(p_names)<>'array' THEN RETURN jsonb_build_object('found',found,'not_found',missing); END IF;
 FOR candidate IN SELECT DISTINCT btrim(value) FROM jsonb_array_elements_text(p_names) WHERE length(btrim(value)) BETWEEN 1 AND 80 LIMIT 50 LOOP
  SELECT jsonb_agg(doc) INTO matched FROM (SELECT doc FROM public.fc_runtime_records r WHERE collection=target
   AND (p_game IS NULL OR doc->>'game_id' IS NULL OR doc->>'game_id'=p_game)
   AND (p_country IS NULL OR doc->>'country_id' IS NULL OR doc->>'country_id'=p_country)
   AND EXISTS(SELECT 1 FROM unnest(fields) f WHERE lower(doc->>f)=lower(candidate)) ORDER BY id LIMIT 2) q;
  IF matched IS NULL THEN
   SELECT jsonb_agg(doc) INTO matched FROM (SELECT doc FROM public.fc_runtime_records r WHERE collection=target
    AND (p_game IS NULL OR doc->>'game_id' IS NULL OR doc->>'game_id'=p_game)
    AND (p_country IS NULL OR doc->>'country_id' IS NULL OR doc->>'country_id'=p_country)
    AND EXISTS(SELECT 1 FROM unnest(fields) f WHERE strpos(lower(doc->>f),lower(candidate))>0) ORDER BY id LIMIT 2) q;
  END IF;
  IF jsonb_array_length(matched)=1 THEN
   found:=found||jsonb_build_array(jsonb_build_object('id',matched->0->>'id','name',coalesce(matched->0->>'name',matched->0->>'handle',matched->0->>'tag',candidate),'type',CASE WHEN p_type='player' THEN 'player' ELSE 'team' END));
  ELSE missing:=missing||to_jsonb(candidate); END IF;
 END LOOP;
 RETURN jsonb_build_object('found',found,'not_found',missing);
END;
$$;
REVOKE ALL ON FUNCTION public.fc_search_users(text,boolean),public.fc_search_entrants(jsonb,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.fc_search_users(text,boolean),public.fc_search_entrants(jsonb,text,text,text) TO service_role;
COMMIT;
NOTIFY pgrst,'reload schema';
