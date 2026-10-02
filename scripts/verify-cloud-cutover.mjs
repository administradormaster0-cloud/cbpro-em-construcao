import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {writeFileSync} from 'node:fs';
process.loadEnvFile('.env.supabase.local');
const base=process.env.FC_VERIFY_BASE||'http://127.0.0.1:3002';
const publicHeaders={'Content-Type':'application/json'};
const r=await fetch(base+'/backend/auth/v1/token?grant_type=password',{method:'POST',headers:publicHeaders,body:JSON.stringify({email:'administradormaster0@gmail.com',password:process.env.FC_VERIFY_PASSWORD})});
assert.equal(r.status,200,'Owner login');const session=await r.json();
const headers={...publicHeaders,Authorization:'Bearer '+session.access_token};
const remoteHeaders={apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY};
const id=randomUUID();let created=false;
async function remote(){const r=await fetch(process.env.SUPABASE_URL+'/rest/v1/fc_runtime_records?collection=eq.site_settings&id=eq.'+id,{headers:remoteHeaders});assert.equal(r.status,200);return r.json();}
try{
 const create=await fetch(base+'/backend/rest/v1/site_settings',{method:'POST',headers,body:JSON.stringify({id,key:'cloud_check_'+id,value:'initial'})});assert.equal(create.status,201);created=true;
 assert.equal((await remote())[0].doc.value,'initial');
 const update=await fetch(base+'/backend/rest/v1/site_settings?id=eq.'+id,{method:'PATCH',headers,body:JSON.stringify({value:'verified'})});assert.equal(update.status,200);assert.equal((await remote())[0].doc.value,'verified');
 const denied=await fetch(base+'/backend/rest/v1/site_settings?id=eq.'+id,{method:'PATCH',headers:publicHeaders,body:JSON.stringify({value:'denied'})});assert.equal(denied.status,401);
}finally{if(created){const cleanup=await fetch(base+'/backend/rest/v1/site_settings?id=eq.'+id,{method:'DELETE',headers});assert.equal(cleanup.status,200);assert.equal((await remote()).length,0);}}
const health=await(await fetch(base+'/api/health')).json();assert.equal(health.persistence.local_database_reads,false);assert.equal(health.persistence.cache,'memory');
const teams=await fetch(base+'/backend/rest/v1/teams?select=id,name&limit=3');assert.equal(teams.status,200);assert.equal((await teams.json()).length,3);
const privateAccess=await fetch(process.env.SUPABASE_URL+'/rest/v1/fc_runtime_records?limit=1',{headers:{apikey:process.env.SUPABASE_ANON_KEY}});assert.ok([401,403].includes(privateAccess.status));
const report={at:new Date().toISOString(),project:process.env.SUPABASE_PROJECT_REF,owner_login:true,remote_create_update_delete:true,anonymous_write_denied:true,private_remote_read_denied:true,public_team_read:true,health};
writeFileSync('data/cloud-cutover-verification.json',JSON.stringify(report,null,2));console.log(report);
