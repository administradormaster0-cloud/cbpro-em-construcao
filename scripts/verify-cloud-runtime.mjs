import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
process.loadEnvFile('.env.supabase.local');
const base='http://127.0.0.1:3000',id=randomUUID();
const password=readFileSync('data/ACESSO-LOCAL.txt','utf8').match(/Senha: (.+)/)[1].trim();
const auth=await fetch(base+'/backend/auth/v1/token?grant_type=password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'admin@fcclubs.local',password})});
assert.equal(auth.status,200);const session=await auth.json();
const headers={'Content-Type':'application/json',Authorization:'Bearer '+session.access_token};
const remoteHeaders={apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY};
const path='/backend/rest/v1/site_settings?id=eq.'+id;
async function remote(){const r=await fetch(process.env.SUPABASE_URL+'/rest/v1/fc_runtime_records?collection=eq.site_settings&id=eq.'+id,{headers:remoteHeaders});assert.equal(r.status,200);return r.json();}
let created=false;
try{
 const r=await fetch(base+'/backend/rest/v1/site_settings',{method:'POST',headers,body:JSON.stringify({id,key:'verification_'+id,value:'initial'})});assert.equal(r.status,201);created=true;
 assert.equal((await remote())[0].doc.value,'initial');
 const update=await fetch(base+path,{method:'PATCH',headers,body:JSON.stringify({value:'confirmed'})});assert.equal(update.status,200);assert.equal((await remote())[0].doc.value,'confirmed');
 const denied=await fetch(base+path,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({value:'unauthorized'})});assert.equal(denied.status,401);assert.equal((await remote())[0].doc.value,'confirmed');
 const privateRead=await fetch(process.env.SUPABASE_URL+'/rest/v1/fc_runtime_records?limit=1',{headers:{apikey:process.env.SUPABASE_ANON_KEY}});assert.ok([401,403].includes(privateRead.status));
}finally{if(created){const r=await fetch(base+path,{method:'DELETE',headers});assert.equal(r.status,200);assert.equal((await remote()).length,0);}}
const health=await (await fetch(base+'/api/health')).json();
const report={at:new Date().toISOString(),create:true,update:true,delete:true,anonymous_write_denied:true,anonymous_cloud_read_denied:true,cleanup:true,health};
writeFileSync('data/cloud-runtime-verification.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
