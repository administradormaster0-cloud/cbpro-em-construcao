DO $fix$
DECLARE target record; definition text; changed integer := 0;
BEGIN
  FOR target IN SELECT p.oid, p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname IN ('fc_edge_select','fc_runtime_commit')
  LOOP
    definition := pg_get_functiondef(target.oid);
    IF position('FC_REVISION_CONFLICT' in definition)=0 THEN
      RAISE EXCEPTION 'Expected application revision guard missing in %',target.proname;
    END IF;
    IF definition ~ 'ERRCODE\s*=\s*''40001''' THEN
      definition := regexp_replace(definition,'ERRCODE\s*=\s*''40001''','ERRCODE=''PT409''','g');
      EXECUTE definition;
      changed := changed+1;
    ELSIF definition !~ 'ERRCODE\s*=\s*''PT409''' THEN
      RAISE EXCEPTION 'Unexpected revision guard error code in %',target.proname;
    END IF;
  END LOOP;
  IF NOT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='fc_edge_select') THEN
    RAISE EXCEPTION 'Expected edge select function missing';
  END IF;
END;
$fix$;
NOTIFY pgrst,'reload schema';
