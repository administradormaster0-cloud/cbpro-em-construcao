import {runCloud,get,save,where,all} from './db.mjs';
import {publicAnonKey} from './public-config.mjs';
import {rest} from './rest.mjs';
import {rpc,invoke} from './rpc.mjs';
import {adminUsers} from './admin.mjs';
import {ensureCredits} from './credits.mjs';
import {paginateRpc} from './rpc-response.mjs';
import {searchEaCloud} from './ea-cloud.mjs';
import {createCompetition,generatePlayoffs,recordResult,transferPlayer,generateExistingStage} from './competition.mjs';
const root=Deno.env.get('SUPABASE_URL')!,key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,anon=Deno.env.get('SUPABASE_ANON_KEY')!;
const serverHeaders={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info,prefer,range,range-unit,accept-profile,content-profile,x-upsert,x-supabase-api-version','Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,PUT,HEAD,OPTIONS','Access-Control-Expose-Headers':'Content-Range'};
function localized(value:unknown):unknown{if(typeof value==='string')return value.replaceAll('https://pkoysigjsorpefekkiqf.supabase.co',root).replaceAll('https://bjgfpygzmosxahvcqrwe.supabase.co',root);if(Array.isArray(value))return value.map(localized);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,localized(v)]));return value;}
const reply=(data:unknown,status=200,headers={})=>new Response(JSON.stringify(localized(data)),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
async function database(name:string,body:unknown){const r=await fetch(root+'/rest/v1/rpc/'+name,{method:'POST',headers:serverHeaders,body:JSON.stringify(body),signal:AbortSignal.timeout(30000)});const d=await r.json();if(!r.ok)throw Object.assign(Error(['40001','PT409'].includes(d.code)?'Dados atualizados por outra operação. Tente novamente.':'Não foi possível consultar os dados.'),{status:['40001','PT409'].includes(d.code)?409:503,code:d.code});return d;}
async function revision(){const r=await fetch(root+'/rest/v1/fc_runtime_state?id=eq.1&select=revision',{headers:serverHeaders});if(!r.ok)throw Error('Database unavailable');return (await r.json())[0].revision;}
function identity(remote:any){if(!remote)return null;let row=get('users_profile',remote.id);if(!row)row=where('users_profile','auth_user_id',remote.id)[0];if(!row&&remote.email)row=where('users_profile','email',String(remote.email).toLowerCase())[0];if(!row)row=save('users_profile',{id:remote.id,email:remote.email,display_name:remote.user_metadata?.display_name||remote.email.split('@')[0],created_at:remote.created_at,onboarding_completed:false,preferred_language:'pt-BR'});
 const dataId=row.legacy_user_id||row.id;const role=where('user_roles','user_id',dataId).concat(where('user_roles','user_id',row.id)).some((r:any)=>['ADMIN','SUPERADMIN'].includes(get('roles',r.role_id)?.key))?'admin':'member';const user={id:dataId,profile_id:row.id,auth_user_id:remote.id,email:remote.email,role,cloud_user:remote};ensureCredits(user);return user;
}
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 const url=new URL(req.url),path=url.pathname.replace(/^.*\/fc-api\/?/,'/').replace(/^\/invoke\//,'/functions/v1/');
 try{
  if(path==='/health'||path==='/api/health')return reply({ok:true,storage:'supabase',authentication:'supabase',mode:'supabase-edge',local_runtime:false});
  const token=req.headers.get('authorization')?.replace(/^Bearer /i,'');let remote=null;
  if(token&&token!==anon&&token!==publicAnonKey){const r=await fetch(root+'/auth/v1/user',{headers:{apikey:anon,Authorization:'Bearer '+token},signal:AbortSignal.timeout(12000)});if(!r.ok)return reply({message:'Sessão inválida. Faça login novamente.'},401);remote=await r.json();}
  if(path.startsWith('/storage/v1/object/')&&['POST','PUT','DELETE'].includes(req.method)){
   if(!remote)return reply({message:'Faça login.'},401);
   const id=path.slice('/storage/v1/object/'.length);if(!/^[a-z0-9_-]+\/[\w./-]+$/i.test(id)||id.includes('..'))return reply({message:'Caminho inválido.'},400);
   const state=await runCloud(()=>identity(remote),{request:database,revision:await revision()});
   if(state.result.role!=='admin'&&!id.split('/').includes(remote.id))return reply({message:'Use sua pasta de usuário.'},403);
   const mime=req.headers.get('content-type')||'';if(!['image/png','image/jpeg','image/webp'].includes(mime.split(';')[0])&&req.method!=='DELETE')return reply({message:'Use PNG, JPEG ou WebP.'},400);
   const bytes=await req.arrayBuffer();if(bytes.byteLength>5000000)return reply({message:'Arquivo excede 5 MB.'},413);
   const r=await fetch(root+path,{method:req.method,headers:{...serverHeaders,'Content-Type':mime,'x-upsert':req.headers.get('x-upsert')||'false'},body:req.method==='DELETE'?undefined:bytes});return reply(await r.json(),r.status);
  }
  if(!['GET','HEAD','POST','PATCH','DELETE','PUT'].includes(req.method))return reply({message:'Método inválido.'},405);
  const raw=['GET','HEAD'].includes(req.method)?'':await req.text();if(raw.length>5000000)return reply({message:'Solicitação excede 5 MB.'},413);const body=raw?JSON.parse(raw):{};
  if(path==='/functions/v1/search-ea-clubs')return reply(await searchEaCloud(body.name||body.clubName||url.searchParams.get('name')||'',database));
  if(path==='/api/stats')return reply(await database('fc_edge_stats',{}));
  if(path.startsWith('/rest/v1/rpc/')&&['fn_top_performers_highlight','fn_top_performer_career','fn_rnk_player_season_rows','fn_season_pro_players_icons'].includes(path.split('/').at(-1)!)){
   const name=path.split('/').at(-1)!,cacheKey=name+':'+JSON.stringify(body),cached=await database('fc_edge_cached',{p_key:cacheKey});let data=cached.value;
   if(!cached.hit){const rev=await revision();data=(await runCloud(()=>rpc(name,body,null),{request:database,revision:rev})).result;await database('fc_edge_cache_put',{p_key:cacheKey,p_revision:rev,p_value:data});}
   const result=paginateRpc(data,url.searchParams,req.headers.get('range'));return reply(result.data,200,result.headers);
  }
  let output;for(let attempt=0;attempt<3;attempt++)try{
   output=await runCloud(()=>{
    const user=identity(remote),admin=()=>{if(user?.role!=='admin')throw Object.assign(Error('Acesso administrativo necessário.'),{status:user?403:401});};
    const q=new URLSearchParams(url.search),headers=Object.fromEntries(req.headers);
    if(path.startsWith('/rest/v1/rpc/')){const p=paginateRpc(rpc(path.split('/').at(-1),body,user),q,headers.range);return {data:p.data,status:200,headers:p.headers};}
    if(path.startsWith('/rest/v1/')){const table=path.split('/').at(-1)!;if(table.startsWith('fc_runtime_'))throw Object.assign(Error('Sem permissão.'),{status:403});const range=headers.range?.match(/(\d+)-(\d+)/);if(range){q.set('offset',range[1]);q.set('limit',String(Number(range[2])-Number(range[1])+1));}
     const data=rest(table,req.method,q,body,user,headers);let rows=data.data;
     if(headers.accept?.includes('vnd.pgrst.object')){if(rows.length!==1)return {data:{code:'PGRST116',message:'JSON object requested, multiple (or no) rows returned'},status:406};rows=rows[0];}
     return {data:rows,status:req.method==='POST'?201:200,headers:{'Content-Range':data.count?`${data.offset}-${data.offset+data.data.length-1}/${data.count}`:'*/0'}};
    }
    if(path.startsWith('/functions/v1/admin-users'))return {data:adminUsers(user,path.slice('/functions/v1/admin-users'.length).split('/').filter(Boolean),req.method,body,q),status:200};
    if(path.startsWith('/functions/v1/'))return {data:invoke(path.split('/').at(-1),{...Object.fromEntries(q),...body},user),status:200};
    if(path==='/api/session')return {data:{user:user?{id:user.id,email:user.email,role:user.role,local_role:user.role}:null},status:200};
    if(path==='/api/audit'){admin();return {data:all('fc_audit').sort((a:any,b:any)=>b.created_at.localeCompare(a.created_at)).slice(0,100),status:200};}
    if(path==='/api/import-report'){admin();return {data:get('fc_system_reports','import'),status:200};}
    if(path==='/api/competitions'&&req.method==='POST'){admin();return {data:createCompetition(user,body),status:201};}
    let match=path.match(/^\/api\/stages\/([^/]+)\/generate$/);if(match&&req.method==='POST')return {data:generateExistingStage(user,match[1],body),status:201};
    match=path.match(/^\/api\/competitions\/([^/]+)\/playoffs$/);if(match&&req.method==='POST'){admin();return {data:generatePlayoffs(user,match[1],body),status:201};}
    match=path.match(/^\/api\/matches\/([^/]+)\/result$/);if(match&&req.method==='POST'){admin();return {data:recordResult(user,match[1],body),status:200};}
    if(path==='/api/transfers'&&req.method==='POST'){admin();return {data:transferPlayer(user,body.player_profile_id,body.to_team_id,body.reason),status:201};}
    return {data:{message:'Operação não encontrada.',path},status:404};
   },{request:database,revision:await revision()});break;
  }catch(e){if(['40001','PT409'].includes(e.code)&&attempt<2)continue;throw e;}
  return req.method==='HEAD'?new Response(null,{status:output.result.status,headers:{...cors,...output.result.headers}}):reply(output.result.data,output.result.status,output.result.headers);
 }catch(e){console.error(e.message);return reply({message:e instanceof SyntaxError?'JSON inválido.':e.message,code:e.provider_code||e.code},e instanceof SyntaxError?400:e.status||503);}
});
