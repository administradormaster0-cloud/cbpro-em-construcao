import json,re

def optimize(definition):
 match=re.search(r"DECLARE seed jsonb := '(.*?)'::jsonb;",definition,re.S)
 if not match:raise ValueError('Snapshot seed not found')
 seed=json.loads(match.group(1).replace("''","'"));removed=0;total=0;keys=set()
 for route,entries in seed.items():
  kept=[]
  for entry in entries:
   if entry.get('args',{}).get('p_collection') in ('drafts','draft_entries'):
    removed+=1;continue
   kept.append(entry);total+=1;keys.add(json.dumps([entry['name'],entry['args']],sort_keys=True))
  seed[route]=kept
 replacement="DECLARE seed jsonb := '"+json.dumps(seed,ensure_ascii=False).replace("'","''")+"'::jsonb;"
 definition=definition[:match.start()]+replacement+definition[match.end():]
 if 'route_entry record;' not in definition or "BEGIN\n CASE item->>'name'" not in definition or 'END CASE;\n entries:=' not in definition:raise ValueError('Unexpected snapshot control flow')
 definition=definition.replace('route_entry record;','route_entry record; query_results jsonb:=\'{}\'::jsonb; query_key text;',1)
 definition=definition.replace("BEGIN\n CASE item->>'name'","BEGIN\n query_key:=jsonb_build_array(item->>'name',a)::text;\n IF query_results ? query_key THEN result:=query_results->query_key; ELSE\n CASE item->>'name'",1)
 definition=definition.replace('END CASE;\n entries:=','END CASE;\n query_results:=query_results||jsonb_build_object(query_key,result);\n END IF;\n entries:=',1)
 return definition,{'removedRetiredDraftQueries':removed,'retainedEntries':total,'uniqueOriginalQueries':len(keys),'reusableReads':total-len(keys)}
