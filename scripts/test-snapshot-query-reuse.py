import json,pathlib,re,importlib.util
spec=importlib.util.spec_from_file_location('optimizer','scripts/optimize-snapshot-definition.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
original=pathlib.Path('.impeccable/reconstruction/snapshot-before-query-reuse.sql').read_text(encoding='utf-8');updated,changes=module.optimize(original)
def seed(text):return json.loads(re.search(r"DECLARE seed jsonb := '(.*?)'::jsonb;",text,re.S).group(1).replace("''","'"))
before,after=seed(original),seed(updated)
assert set(before)==set(after)
for route,entries in before.items():assert after[route]==[entry for entry in entries if entry.get('args',{}).get('p_collection') not in ('drafts','draft_entries')]
for marker in ['pg_try_advisory_xact_lock(78203791)','EXCEPTION WHEN invalid_parameter_value','cbpro_publish_public_snapshots','INSERT INTO public.cbpro_public_route_snapshots']:
 assert marker in updated
normalized=updated.replace(" route_entry record; query_results jsonb:='{}'::jsonb; query_key text;"," route_entry record;").replace("BEGIN\n query_key:=jsonb_build_array(item->>'name',a)::text;\n IF query_results ? query_key THEN result:=query_results->query_key; ELSE\n CASE item->>'name'","BEGIN\n CASE item->>'name'").replace("END CASE;\n query_results:=query_results||jsonb_build_object(query_key,result);\n END IF;\n entries:=","END CASE;\n entries:=")
assert normalized[normalized.index('BEGIN'):]==original[original.index('BEGIN'):]
report={'passed':True,**changes,'scope':'Retained seed entries and function body verified except memoization and explicit retired Draft removal. Live refresh completion measured separately.'}
pathlib.Path('.impeccable/reconstruction/snapshot-query-reuse-test.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
