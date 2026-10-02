import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
process.loadEnvFile(fileURLToPath(new URL('../.env.supabase.local',import.meta.url)));
const url=`https://api.supabase.com/v1/projects/${process.env.SUPABASE_PROJECT_REF}/database/query`;
async function query(sql){const response=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({query:sql}),signal:AbortSignal.timeout(60000)});if(!response.ok)throw Error(`Runtime setup HTTP ${response.status}: ${await response.text()}`);return response.json();}
await query(readFileSync(fileURLToPath(new URL('../supabase/runtime.sql',import.meta.url)),'utf8'));
const [{revision}]=await query('select revision from public.fc_runtime_state where id=1');
if(Number(revision)!==0){console.log('Runtime already initialized; data preserved.');process.exit(0);}
const tables=JSON.parse(readFileSync(fileURLToPath(new URL('../data/supabase-setup-report.json',import.meta.url)),'utf8')).tables.map(t=>t.table);
for(const table of tables){if(!/^[a-z][a-z0-9_]*$/.test(table))throw Error('Invalid collection');await query(`INSERT INTO public.fc_runtime_records(collection,id,doc) SELECT '${table}',id::text,to_jsonb(t) FROM public."${table}" t ON CONFLICT DO NOTHING;`);}
await query('update public.fc_runtime_state set revision=1 where id=1 and revision=0');
console.log('Cloud runtime initialized from verified staging tables.');
