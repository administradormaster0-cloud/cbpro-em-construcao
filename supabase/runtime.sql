BEGIN;
CREATE TABLE IF NOT EXISTS public.fc_runtime_records (
 collection text NOT NULL, id text NOT NULL, doc jsonb NOT NULL,
 PRIMARY KEY(collection,id), CHECK (jsonb_typeof(doc)='object')
);
CREATE TABLE IF NOT EXISTS public.fc_runtime_state (
 id integer PRIMARY KEY CHECK(id=1), revision bigint NOT NULL DEFAULT 0
);
INSERT INTO public.fc_runtime_state(id,revision) VALUES(1,0) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS public.fc_runtime_operations (
 id uuid PRIMARY KEY, revision bigint NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fc_runtime_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fc_runtime_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fc_runtime_operations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.fc_runtime_records,public.fc_runtime_state,public.fc_runtime_operations FROM anon,authenticated;
GRANT ALL ON public.fc_runtime_records,public.fc_runtime_state,public.fc_runtime_operations TO service_role;
CREATE OR REPLACE FUNCTION public.fc_runtime_commit(p_operation uuid,p_revision bigint,p_changes jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $$
DECLARE current_revision bigint; completed bigint; change jsonb; target text; record_id text;
BEGIN
 SELECT revision INTO current_revision FROM public.fc_runtime_state WHERE id=1 FOR UPDATE;
 SELECT revision INTO completed FROM public.fc_runtime_operations WHERE id=p_operation;
 IF FOUND THEN RETURN jsonb_build_object('revision',completed,'replayed',true); END IF;
 IF current_revision<>p_revision THEN RAISE EXCEPTION 'FC_REVISION_CONFLICT' USING ERRCODE='PT409'; END IF;
 IF jsonb_typeof(p_changes)<>'array' OR jsonb_array_length(p_changes)>10000 THEN RAISE EXCEPTION 'Invalid change batch'; END IF;
 FOR change IN SELECT value FROM jsonb_array_elements(p_changes) LOOP
  target:=change->>'collection'; record_id:=change->>'id';
  IF target !~ '^[a-z][a-z0-9_]*$' OR target LIKE 'fc_runtime_%' OR record_id IS NULL THEN RAISE EXCEPTION 'Invalid record'; END IF;
  IF change->>'action'='delete' THEN
   DELETE FROM public.fc_runtime_records WHERE collection=target AND id=record_id;
  ELSIF change->>'action'='save' AND change->'doc'->>'id'=record_id THEN
   INSERT INTO public.fc_runtime_records(collection,id,doc) VALUES(target,record_id,change->'doc')
   ON CONFLICT(collection,id) DO UPDATE SET doc=excluded.doc;
  ELSE RAISE EXCEPTION 'Invalid operation'; END IF;
 END LOOP;
 current_revision:=current_revision+1;
 UPDATE public.fc_runtime_state SET revision=current_revision WHERE id=1;
 INSERT INTO public.fc_runtime_operations(id,revision) VALUES(p_operation,current_revision);
 RETURN jsonb_build_object('revision',current_revision,'replayed',false);
END;
$$;
REVOKE ALL ON FUNCTION public.fc_runtime_commit(uuid,bigint,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.fc_runtime_commit(uuid,bigint,jsonb) TO service_role;
COMMIT;
NOTIFY pgrst,'reload schema';
