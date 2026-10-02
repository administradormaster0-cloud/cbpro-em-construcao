CREATE OR REPLACE FUNCTION public.fc_public_select(p_collection text, p_filter jsonb DEFAULT '{"op": "and", "children": []}'::jsonb, p_order jsonb DEFAULT '[]'::jsonb, p_limit integer DEFAULT 1000, p_offset integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
 SET jit TO 'off'
 SET lock_timeout TO '2s'
 SET statement_timeout TO '8s'
AS $function$
DECLARE
  sort text := '';
  item jsonb;
  rows jsonb;
  cnt bigint;
  filter text;
BEGIN
  IF p_collection IS NULL
     OR p_collection !~ '^[a-z][a-z0-9_]*$'
     OR p_collection LIKE 'fc\_%' ESCAPE '\'
     OR p_collection = ANY (ARRAY[
       'avatar_offers','fc_audit','fc_system_reports','local_field_edits','local_edit_operations','users_profile','user_roles',
       'user_ai_credits','credit_transactions','direct_messages','direct_conversations','admin_user_permissions',
       'admin_section_permissions','admin_user_feature_access','org_staff_invites','organization_requests','bans',
       'player_profile_change_logs','account_deletion_requests'
     ])
     OR p_limit < 0 OR p_limit > 10000 OR p_offset < 0 OR p_offset > 1000000
  THEN
    RAISE EXCEPTION 'permission denied' USING ERRCODE = '42501';
  END IF;
  IF jsonb_typeof(p_filter) <> 'object' OR jsonb_typeof(p_order) <> 'array' OR jsonb_array_length(p_order) > 8 THEN
    RAISE EXCEPTION 'Invalid request' USING ERRCODE = '22023';
  END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(p_order) LOOP
    IF item->>'key' !~ '^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)*$' THEN
      RAISE EXCEPTION 'Invalid order' USING ERRCODE = '22023';
    END IF;
    sort := sort || CASE WHEN sort = '' THEN '' ELSE ',' END || format(
      'nullif(doc #> %L::text[], ''null''::jsonb) %s NULLS %s',
      string_to_array(item->>'key', '.'),
      CASE WHEN item->>'direction' = 'desc' THEN 'DESC' ELSE 'ASC' END,
      CASE WHEN item->>'empty' = 'nullsfirst' THEN 'FIRST' ELSE 'LAST' END
    );
  END LOOP;
  IF sort = '' THEN sort := 'id'; END IF;
  filter := public.fc_edge_filter(p_filter);
  EXECUTE 'SELECT count(*) FROM public.fc_runtime_records WHERE collection = $1 AND ' || filter INTO cnt USING p_collection;
  EXECUTE 'SELECT coalesce(jsonb_agg(doc), ''[]''::jsonb) FROM (SELECT doc FROM public.fc_runtime_records WHERE collection = $1 AND ' || filter || ' ORDER BY ' || sort || ' LIMIT $2 OFFSET $3) q' INTO rows USING p_collection, p_limit, p_offset;
  RETURN jsonb_build_object('rows', rows, 'count', cnt, 'offset', p_offset);
END;
$function$
;
