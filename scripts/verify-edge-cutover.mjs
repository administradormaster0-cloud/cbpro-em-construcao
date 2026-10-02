import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import {writeFileSync} from 'node:fs';
process.loadEnvFile('.env.supabase.local');const root=process.env.SUPABASE_URL,api=root+'/functions/v1/fc-api',service={apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json'},publicHeaders={apikey:process.env.SUPABASE_ANON_KEY,'Content-Type':'application/json'};
const link=await fetch(root+'/auth/v1/admin/generate_link',{method:'POST',headers:service,body:JSON.stringify({type:'magiclink',email:'administradormaster0@gmail.com'})});assert.equal(link.status,200);const generated=await link.json();
const auth=await fetch(root+'/auth/v1/verify',{method:'POST',headers:publicHeaders,body:JSON.stringify({type:'magiclink',token_hash:generated.hashed_token})});assert.equal(auth.status,200);const session=await auth.json(),headers={...publicHeaders,Authorization:'Bearer '+session.access_token};
const checks={};async function call(path,method='GET',body,authenticated=false){const r=await fetch(api+path,{method,headers:authenticated?headers:publicHeaders,body:body===undefined?undefined:JSON.stringify(body)});const d=await r.json();return {status:r.status,data:d};}
checks.health=await call('/health');assert.equal(checks.health.data.local_runtime,false);
const browserHeaders={...publicHeaders,Authorization:'Bearer '+process.env.SUPABASE_ANON_KEY,'Accept-Profile':'public'};
const browserRead=await fetch(api+'/rest/v1/countries?select=id&limit=1',{headers:browserHeaders});assert.equal(browserRead.status,200);checks.browser_anonymous_read=true;
const preflight=await fetch(api+'/rest/v1/countries',{method:'OPTIONS',headers:{Origin:'https://navajowhite-alpaca-413377.hostingersite.com','Access-Control-Request-Headers':'accept-profile,authorization,apikey'}});assert.ok(preflight.headers.get('access-control-allow-headers').includes('accept-profile'));checks.browser_preflight=true;
checks.relations=await call('/rest/v1/teams?select=id,name,games(name)&limit=3');assert.equal(checks.relations.status,200);assert.equal(checks.relations.data.length,3);assert.ok(checks.relations.data[0].games.name);
checks.owner=await call('/api/session','GET',undefined,true);assert.equal(checks.owner.data.user.role,'admin');
const id=randomUUID();let created=false;
try{const create=await call('/rest/v1/site_settings','POST',{id,key:'cloud_verify_'+id,value:'before'},true);assert.equal(create.status,201,JSON.stringify(create.data));created=true;
 const update=await call('/rest/v1/site_settings?id=eq.'+id,'PATCH',{value:'after'},true);assert.equal(update.status,200);assert.equal(update.data[0].value,'after');
 const stored=await(await fetch(root+'/rest/v1/fc_runtime_records?collection=eq.site_settings&id=eq.'+id,{headers:service})).json();assert.equal(stored[0].doc.value,'after');checks.persisted_mutation=true;
 const denied=await call('/rest/v1/site_settings?id=eq.'+id,'PATCH',{value:'denied'});assert.equal(denied.status,401);checks.anonymous_write_denied=true;
}finally{if(created){const r=await call('/rest/v1/site_settings?id=eq.'+id,'DELETE',undefined,true);assert.equal(r.status,200);}}
checks.ea=await call('/invoke/search-ea-clubs','POST',{name:'Arsenal'});assert.equal(checks.ea.status,200);assert.ok(checks.ea.data.results.length>0);
checks.entrants=await call('/invoke/search-tournament-entrants','POST',{names:['Ghost United'],type:'team'});assert.equal(checks.entrants.status,200);assert.equal(checks.entrants.data.found.length,1);
checks.private_read=await call('/rest/v1/users_profile?select=email');assert.deepEqual(checks.private_read.data,[]);
checks.direct_read=await fetch(root+'/rest/v1/fc_runtime_records?limit=1',{headers:publicHeaders}).then(r=>r.status);assert.ok(checks.direct_read>=400);
await fetch(root+'/auth/v1/logout?scope=local',{method:'POST',headers});
writeFileSync('data/edge-cutover-verification.json',JSON.stringify({at:new Date().toISOString(),project:process.env.SUPABASE_PROJECT_REF,checks},null,2));console.log({verified:true,checks:Object.keys(checks)});
