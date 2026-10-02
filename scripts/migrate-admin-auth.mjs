import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createClient} from '@supabase/supabase-js';
import {db,get} from '../server/db.mjs';
process.loadEnvFile(fileURLToPath(new URL('../.env.supabase.local',import.meta.url)));
const client=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const local=db.prepare("select id,email from accounts where email='admin@fcclubs.local' and role='admin'").get();if(!local)throw Error('Local bootstrap administrator missing');
const {data:existing,error:lookup}=await client.auth.admin.getUserById(local.id);
if(lookup&&lookup.status!==404)throw Error('Cloud user lookup failed: '+lookup.status);
if(!existing?.user){
 const password=readFileSync(fileURLToPath(new URL('../data/ACESSO-LOCAL.txt',import.meta.url)),'utf8').match(/Senha: (.+)/)?.[1]?.trim();if(!password)throw Error('Bootstrap credential missing');
 const {data,error}=await client.auth.admin.createUser({id:local.id,email:local.email,password,email_confirm:true,user_metadata:{display_name:get('users_profile',local.id)?.display_name||'Administrador'},app_metadata:{migration_source:'fcclubs-local-bootstrap'}});
 if(error)throw Error('Administrator migration failed: '+error.message);if(data.user.id!==local.id)throw Error('Cloud identity mismatch');
}
writeFileSync(fileURLToPath(new URL('../data/cloud-auth-migration.json',import.meta.url)),JSON.stringify({at:new Date().toISOString(),id:local.id,email:local.email,provider:'supabase',password_changed:false},null,2));
console.log('Administrator migrated with existing ID and password; credentials omitted.');db.close();
