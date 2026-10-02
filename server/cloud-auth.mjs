import {createClient} from '@supabase/supabase-js';
import {db,get,save,where,transaction} from './db.mjs';
import {ensureCredits} from './credits.mjs';
export function createCloudAuth({url,key,fetch:fetcher=fetch,siteUrl=process.env.APP_URL||'http://localhost:3000'}){
 const client=()=>createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:fetcher}});
 const fail=error=>{throw Object.assign(new Error(error.message||'Falha de autenticação.'),{status:error.status||400});};
 function profile(remote){
  let row=get('users_profile',remote.id);
  if(!row)row=where('users_profile','auth_user_id',remote.id)[0];
  if(!row&&remote.email)row=where('users_profile','email',String(remote.email).toLowerCase())[0];
  if(!row)transaction(()=>{row=save('users_profile',{id:remote.id,email:remote.email,display_name:remote.user_metadata?.display_name||remote.email?.split('@')[0]||'',preferred_language:'pt-BR',created_at:remote.created_at,onboarding_completed:false});ensureCredits({id:remote.id,role:'member'});});
  // Never authorize from user-editable auth metadata. Migrated accounts keep the old id in legacy_user_id.
  const dataId=row.legacy_user_id||row.id;
  const role=where('user_roles','user_id',dataId).concat(where('user_roles','user_id',row.id)).some(r=>['ADMIN','SUPERADMIN'].includes(get('roles',r.role_id)?.key))?'admin':'member';
  return {id:dataId,profile_id:row.id,auth_user_id:remote.id,email:remote.email,role,cloud_user:remote};
 }
 return {
  async settings(){const response=await fetcher(url+'/auth/v1/settings',{headers:{apikey:key},signal:AbortSignal.timeout(20000)});const data=await response.json();if(!response.ok)fail({...data,status:response.status});return data;},
  async authenticate(token){if(!token||token.split('.').length!==3)return null;const {data,error}=await client().auth.getUser(token);if(error||!data.user)return null;return profile(data.user);},
  async login(email,password){const {data,error}=await client().auth.signInWithPassword({email,password});if(error)fail(error);profile(data.user);return {...data.session,user:data.user};},
  async signup(p){const {data,error}=await client().auth.signUp({email:p.email,password:p.password,options:{data:{display_name:p.data?.display_name||p.data?.gamertag||''},emailRedirectTo:new URL('/onboarding',siteUrl).href}});if(error)fail(error);if(data.session)profile(data.user);return data.session?{...data.session,user:data.user}:{user:data.user,session:null};},
  async refresh(token){const {data,error}=await client().auth.refreshSession({refresh_token:token});if(error)fail(error);profile(data.user);return {...data.session,user:data.user};},
  async update(token,p){const allowed={};for(const k of ['password','email','data'])if(p[k]!==undefined)allowed[k]=p[k];
   const response=await fetcher(url+'/auth/v1/user',{method:'PUT',headers:{apikey:key,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(allowed),signal:AbortSignal.timeout(20000)});const data=await response.json();if(!response.ok)fail({...data,status:response.status});profile(data);return data;
  },
  async logout(token){const response=await fetcher(url+'/auth/v1/logout?scope=local',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+token},signal:AbortSignal.timeout(20000)});if(!response.ok&&response.status!==401)fail({message:'Falha ao encerrar sessão.',status:response.status});return {};},
  async recover(email){const {error}=await client().auth.resetPasswordForEmail(email,{redirectTo:new URL('/reset-password',siteUrl).href});if(error)fail(error);return {};},
  async otp(email, redirectTo, createUser=true){const {error}=await client().auth.signInWithOtp({email, options:{shouldCreateUser:createUser!==false, emailRedirectTo:redirectTo}});if(error)fail(error);return {};},
  async verifyOtp(email, token, type){const {data,error}=await client().auth.verifyOtp({email, token, type:type||'email'});if(error)fail(error);if(data.user)profile(data.user);return data.session?{...data.session,user:data.user}:{};},
 };
}
