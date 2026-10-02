BEGIN;
CREATE OR REPLACE FUNCTION public.fc_edge_filter(f jsonb) RETURNS text
LANGUAGE plpgsql IMMUTABLE SET search_path=pg_catalog,public AS $$
DECLARE expr text; op text:=f->>'op'; v text:=f->>'value'; result text; child jsonb; items text[]:='{}'; path text;
BEGIN
 IF f ? 'children' THEN
  IF op NOT IN ('and','or') THEN RAISE EXCEPTION 'Invalid group'; END IF;
  FOR child IN SELECT value FROM jsonb_array_elements(f->'children') LOOP items:=array_append(items,public.fc_edge_filter(child)); END LOOP;
  IF cardinality(items)=0 THEN RETURN CASE WHEN op='and' THEN 'true' ELSE 'false' END; END IF;
  RETURN '('||array_to_string(items,' '||upper(op)||' ')||')';
 END IF;
 path:=f->>'key'; IF path !~ '^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)*$' THEN RAISE EXCEPTION 'Invalid field'; END IF;
 expr:=format('(doc #>> %L::text[])',string_to_array(path,'.'));
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
END;$$;
CREATE OR REPLACE FUNCTION public.fc_edge_select(p_collection text,p_revision bigint,p_filter jsonb DEFAULT '{"op":"and","children":[]}',p_order jsonb DEFAULT '[]',p_limit integer DEFAULT 1000,p_offset integer DEFAULT 0,p_changes jsonb DEFAULT '[]',p_fields jsonb DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=pg_catalog,public SET jit=off AS $$
DECLARE state bigint; base text; sort text:=''; item jsonb; result jsonb; projection text:='doc'; field_items text[]:='{}';
BEGIN
 SELECT revision INTO state FROM public.fc_runtime_state WHERE id=1;
 IF state<>p_revision THEN RAISE EXCEPTION 'FC_REVISION_CONFLICT' USING ERRCODE='PT409'; END IF;
 IF p_collection !~ '^[a-z][a-z0-9_]*$' OR p_limit<0 OR p_limit>100000 OR p_offset<0 THEN RAISE EXCEPTION 'Invalid request'; END IF;
 FOR item IN SELECT value FROM jsonb_array_elements(p_order) LOOP
  IF item->>'key' !~ '^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)*$' THEN RAISE EXCEPTION 'Invalid order'; END IF;
  sort:=sort||CASE WHEN sort='' THEN '' ELSE ',' END||format('nullif(doc #> %L::text[],''null''::jsonb) %s NULLS %s',string_to_array(item->>'key','.'),CASE WHEN item->>'direction'='desc' THEN 'DESC' ELSE 'ASC' END,CASE WHEN item->>'empty'='nullsfirst' THEN 'FIRST' ELSE 'LAST' END);
 END LOOP;
 IF sort='' THEN sort:='id'; END IF;
 IF p_fields IS NOT NULL THEN
  FOR item IN SELECT value FROM jsonb_array_elements(p_fields) LOOP
   field_items:=array_append(field_items,quote_literal(item->>'alias'));
   field_items:=array_append(field_items,format('(doc #> %L::text[])',string_to_array(item->>'key','.')));
  END LOOP;
  projection:='jsonb_build_object('||array_to_string(field_items,',')||')';
 END IF;
 IF jsonb_array_length(p_changes)=0 THEN
  base:='WITH filtered AS NOT MATERIALIZED (SELECT id,doc FROM public.fc_runtime_records WHERE collection=$2 AND '||public.fc_edge_filter(p_filter)||') ';
 ELSE
  base:='WITH edits AS (SELECT value c FROM jsonb_array_elements($1) WHERE value->>''collection''=$2), effective AS NOT MATERIALIZED (SELECT id,doc FROM public.fc_runtime_records r WHERE collection=$2 AND NOT EXISTS(SELECT 1 FROM edits WHERE c->>''id''=r.id) UNION ALL SELECT c->>''id'',c->''doc'' FROM edits WHERE c->>''action''=''save''), filtered AS NOT MATERIALIZED (SELECT * FROM effective WHERE '||public.fc_edge_filter(p_filter)||') ';
 END IF;
 EXECUTE base||'SELECT jsonb_build_object(''rows'',coalesce((SELECT jsonb_agg(value) FROM (SELECT '||projection||' value FROM filtered ORDER BY '||sort||' LIMIT $3 OFFSET $4) q),''[]''::jsonb),''count'',(SELECT count(*) FROM filtered),''offset'',$4)' INTO result USING p_changes,p_collection,p_limit,p_offset;
 RETURN result;
END;$$;
REVOKE ALL ON FUNCTION public.fc_edge_filter(jsonb),public.fc_edge_select(text,bigint,jsonb,jsonb,integer,integer,jsonb,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.fc_edge_filter(jsonb),public.fc_edge_select(text,bigint,jsonb,jsonb,integer,integer,jsonb,jsonb) TO service_role;
CREATE OR REPLACE FUNCTION public.fc_edge_stats() RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=pg_catalog,public AS $$
 SELECT jsonb_build_object('collections',jsonb_agg(row),'missing_transfer_history',NOT EXISTS(SELECT 1 FROM public.fc_runtime_records WHERE collection='transfer_logs')) FROM (SELECT collection name,count(*) count FROM public.fc_runtime_records GROUP BY collection ORDER BY collection) row;
$$;
REVOKE ALL ON FUNCTION public.fc_edge_stats() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.fc_edge_stats() TO service_role;
CREATE TABLE IF NOT EXISTS public.fc_edge_cache (key text PRIMARY KEY,revision bigint NOT NULL,value jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE public.fc_edge_cache ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.fc_edge_cache FROM anon,authenticated;
GRANT ALL ON public.fc_edge_cache TO service_role;
CREATE OR REPLACE FUNCTION public.fc_edge_cached(p_key text) RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=pg_catalog,public SET jit=off AS $$
 SELECT coalesce((SELECT jsonb_build_object('hit',true,'value',c.value) FROM public.fc_edge_cache c JOIN public.fc_runtime_state s ON s.id=1 AND s.revision=c.revision WHERE c.key=p_key AND c.created_at>now()-interval '5 minutes'),'{"hit":false}'::jsonb);
$$;
CREATE OR REPLACE FUNCTION public.fc_edge_cache_put(p_key text,p_revision bigint,p_value jsonb) RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $$
BEGIN
 IF p_revision<>(SELECT revision FROM public.fc_runtime_state WHERE id=1) THEN RETURN false; END IF;
 INSERT INTO public.fc_edge_cache(key,revision,value) VALUES(p_key,p_revision,p_value) ON CONFLICT(key) DO UPDATE SET revision=excluded.revision,value=excluded.value,created_at=now();RETURN true;
END;$$;
REVOKE ALL ON FUNCTION public.fc_edge_cached(text),public.fc_edge_cache_put(text,bigint,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.fc_edge_cached(text),public.fc_edge_cache_put(text,bigint,jsonb) TO service_role;
COMMIT;
NOTIFY pgrst,'reload schema';
