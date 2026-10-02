import {readFileSync} from 'node:fs';
process.loadEnvFile('.env.supabase.local');
const base=`https://api.supabase.com/v1/projects/${process.env.SUPABASE_PROJECT_REF}`;
const headers={Authorization:'Bearer '+process.env.SUPABASE_ACCESS_TOKEN};
const sql=await fetch(base+'/database/query',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({query:readFileSync('supabase/search-functions.sql','utf8')})});
if(!sql.ok)throw Error(await sql.text());await sql.arrayBuffer();
for(const slug of ['search-users','search-tournament-entrants']){
 const form=new FormData();form.append('metadata',JSON.stringify({entrypoint_path:'index.ts',name:slug,verify_jwt:false}));form.append('file',new Blob([readFileSync('supabase/functions/cloud-search/index.ts')]),'index.ts');
 const r=await fetch(base+'/functions/deploy?slug='+slug,{method:'POST',headers,body:form});const d=await r.json();if(!r.ok)throw Error(JSON.stringify(d));console.log({slug,status:d.status});
}
