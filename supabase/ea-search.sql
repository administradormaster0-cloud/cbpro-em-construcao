BEGIN;
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;
CREATE OR REPLACE FUNCTION public.fc_ea_search(p_name text,p_platform text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public,extensions AS $$
DECLARE response extensions.http_response;
BEGIN
 IF length(btrim(p_name)) NOT BETWEEN 2 AND 40 OR p_platform NOT IN ('common-gen5','common-gen4','nx') THEN RAISE EXCEPTION 'Invalid club search'; END IF;
 PERFORM extensions.http_set_curlopt('CURLOPT_TIMEOUT_MS','5000');
 SELECT * INTO response FROM extensions.http_get('https://proclubs.ea.com/api/fc/allTimeLeaderboard/search?platform='||p_platform||'&clubName='||extensions.urlencode(btrim(p_name)));
 IF response.status<>200 THEN RETURN jsonb_build_object('status',response.status,'data','[]'::jsonb); END IF;
 RETURN jsonb_build_object('status',200,'data',response.content::jsonb);
EXCEPTION WHEN query_canceled THEN RETURN jsonb_build_object('status',504,'data','[]'::jsonb);
END;$$;
REVOKE ALL ON FUNCTION public.fc_ea_search(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.fc_ea_search(text,text) TO service_role;
DO $$ DECLARE r record; BEGIN FOR r IN SELECT p.oid::regprocedure identity FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='extensions' AND (p.proname LIKE 'http%' OR p.proname='urlencode') LOOP EXECUTE 'REVOKE ALL ON FUNCTION '||r.identity||' FROM PUBLIC,anon,authenticated'; EXECUTE 'GRANT EXECUTE ON FUNCTION '||r.identity||' TO service_role'; END LOOP; END $$;
COMMIT;
NOTIFY pgrst,'reload schema';
