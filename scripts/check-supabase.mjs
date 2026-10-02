import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
process.loadEnvFile(fileURLToPath(new URL('../.env.supabase.local',import.meta.url)));
const ref=process.env.SUPABASE_PROJECT_REF,headers={Authorization:`Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`};
async function get(path){const r=await fetch(`https://api.supabase.com/v1/projects/${ref}${path}`,{headers,signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Check HTTP ${r.status}`);return r.json();}
const [project,auth]=await Promise.all([get(''),get('/config/auth')]);
const response=await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({query:"select count(*)::int as tables, count(*) filter (where c.relrowsecurity)::int as rls_enabled, count(*) filter (where has_table_privilege('anon',c.oid,'SELECT'))::int as anonymous_readable, pg_size_pretty(pg_database_size(current_database())) as database_size from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'"})});
if(!response.ok)throw Error(`Database check HTTP ${response.status}`);const [database]=await response.json();
function load(name){const path=fileURLToPath(new URL('../data/'+name,import.meta.url));return existsSync(path)?JSON.parse(readFileSync(path,'utf8')):null;}
const imported=load('supabase-setup-report.json'),media=load('supabase-media-report.json');
const privacy=await fetch(process.env.SUPABASE_URL+'/rest/v1/users_profile?select=id&limit=1',{headers:{apikey:process.env.SUPABASE_ANON_KEY}});
const report={checked_at:new Date().toISOString(),project:{id:ref,name:project.name,status:project.status},auth:{site_url:auth.site_url,redirects:auth.uri_allow_list},database,anonymous_private_read_denied:[401,403].includes(privacy.status),import:{complete:imported?.complete===true,tables:imported?.tables.length||0,records:imported?.tables.reduce((n,t)=>n+t.remote_count,0)||0},media:{complete:media?.complete===true,files:Object.keys(media?.files||{}).length,bytes:Object.values(media?.files||{}).reduce((n,f)=>n+f.bytes,0)},runtime_cutover:false,pending:['Server persistence adapter and authentication migration','Ownership policies and relational constraints','Original-compatible cloud RPCs','Production domain and external service credentials']};
writeFileSync(fileURLToPath(new URL('../data/supabase-verification.json',import.meta.url)),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
if(database.rls_enabled!==database.tables||database.anonymous_readable!==0||!report.anonymous_private_read_denied)process.exitCode=1;
