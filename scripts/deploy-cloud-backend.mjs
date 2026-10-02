import {readFileSync,readdirSync} from 'node:fs';
process.loadEnvFile('.env.supabase.local');
const base=`https://api.supabase.com/v1/projects/${process.env.SUPABASE_PROJECT_REF}`,headers={Authorization:'Bearer '+process.env.SUPABASE_ACCESS_TOKEN};
for(const file of ['edge-data.sql','ea-search.sql']){const sql=await fetch(base+'/database/query',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({query:readFileSync('supabase/'+file,'utf8')})});if(!sql.ok)throw Error(await sql.text());await sql.arrayBuffer();}
const form=new FormData();form.append('metadata',JSON.stringify({entrypoint_path:'index.ts',name:'fc-api',verify_jwt:false}));
for(const file of readdirSync('supabase/functions/fc-api'))form.append('file',new Blob([readFileSync('supabase/functions/fc-api/'+file)]),file);
const r=await fetch(base+'/functions/deploy?slug=fc-api',{method:'POST',headers,body:form});const d=await r.json();if(!r.ok)throw Error(JSON.stringify(d));console.log({name:d.name,status:d.status});
