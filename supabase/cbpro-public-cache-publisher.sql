CREATE OR REPLACE FUNCTION public.cbpro_publish_public_snapshots() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $fn$
DECLARE secret text; item record;
BEGIN
 SELECT decrypted_secret INTO secret FROM vault.decrypted_secrets WHERE name='cbpro_cache_storage_service_role';
 IF secret IS NULL THEN RAISE EXCEPTION 'Snapshot publisher credential unavailable'; END IF;
 FOR item IN SELECT route,payload,refreshed_at FROM public.cbpro_public_route_snapshots LOOP
 PERFORM net.http_post(url:='https://fpnzjhbdtcvglhmxvvzt.supabase.co/storage/v1/object/cbpro-public-cache/'||item.route||'.json',headers:=jsonb_build_object('apikey',secret,'Authorization','Bearer '||secret,'Content-Type','application/json','x-upsert','true','Cache-Control','max-age=30'),body:=jsonb_build_object('entries',item.payload,'refreshed_at',item.refreshed_at),timeout_milliseconds:=15000);
 END LOOP;
END;$fn$;
REVOKE ALL ON FUNCTION public.cbpro_publish_public_snapshots() FROM PUBLIC,anon,authenticated;
