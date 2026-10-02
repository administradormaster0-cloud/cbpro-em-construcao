import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {randomUUID} from 'node:crypto';
process.loadEnvFile('.env.supabase.local');
const base=process.env.SUPABASE_URL;
const headers={apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json'};
async function request(path,options={}){const r=await fetch(base+path,{...options,headers,signal:AbortSignal.timeout(30000)});const d=await r.json();if(!r.ok)throw Error('Supabase HTTP '+r.status);return d;}
const {users}=await request('/auth/v1/admin/users?per_page=100');
const owner=users.find(u=>u.email==='administradormaster0@gmail.com');if(!owner)throw Error('Verified owner account not found');
if(process.env.FC_SETUP_PASSWORD)await request('/auth/v1/admin/users/'+owner.id,{method:'PUT',body:JSON.stringify({password:process.env.FC_SETUP_PASSWORD})});
const roles=await request('/rest/v1/fc_runtime_records?collection=eq.roles&select=id,doc');
const role=roles.find(r=>r.doc.key==='SUPERADMIN');if(!role)throw Error('Superadmin role not found');
const [state]=await request('/rest/v1/fc_runtime_state?id=eq.1&select=revision');if(!state?.revision)throw Error('Migration incomplete');
const records=[
 {collection:'users_profile',id:owner.id,doc:{id:owner.id,email:owner.email,display_name:'Administrador FC Clubs',preferred_language:'pt-BR',created_at:owner.created_at,onboarding_completed:true}},
 {collection:'user_roles',id:'cloud-owner-role',doc:{id:'cloud-owner-role',user_id:owner.id,role_id:role.id}},
 {collection:'fc_system_reports',id:'import',doc:{...JSON.parse(readFileSync('data/import-report.json','utf8')),id:'import'}},
];
const db=new DatabaseSync('data/fcclubs.sqlite',{readOnly:true});
for(const row of db.prepare('select * from audit').all()){const id='imported-audit-'+row.id;records.push({collection:'fc_audit',id,doc:{...row,id}});}db.close();
const result=await request('/rest/v1/rpc/fc_runtime_commit',{method:'POST',body:JSON.stringify({p_operation:randomUUID(),p_revision:Number(state.revision),p_changes:records.map(r=>({...r,action:'save'}))})});
console.log({owner:owner.email,role:'SUPERADMIN',revision:result.revision,imported_audit:records.length-3});
