const url=Deno.env.get('SUPABASE_URL')!;
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const headers={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,GET,OPTIONS'};
const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
async function remote(path:string,body?:unknown){const r=await fetch(url+'/rest/v1/'+path,{method:body===undefined?'GET':'POST',headers,body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('Database request failed');return r.json();}
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(!['GET','POST'].includes(req.method))return reply({message:'Método não permitido.'},405);
 try{
  const endpoint=new URL(req.url);const name=endpoint.pathname.split('/').at(-1);
  const p=req.method==='GET'?Object.fromEntries(endpoint.searchParams):await req.json();
  if(name==='search-tournament-entrants')return reply(await remote('rpc/fc_search_entrants',{p_names:Array.isArray(p.names)?p.names.slice(0,50):[],p_type:p.type||'team',p_game:p.game_id||null,p_country:p.country_id||null}));
  if(name!=='search-users')return reply({message:'Função não encontrada.'},404);
  const token=req.headers.get('authorization');if(!token?.startsWith('Bearer '))return reply({message:'Faça login.'},401);
  const auth=await fetch(url+'/auth/v1/user',{headers:{apikey:key,Authorization:token},signal:AbortSignal.timeout(10000)});
  if(!auth.ok)return reply({message:'Sessão inválida.'},401);
  const user=await auth.json();
  const assignments=await remote('fc_runtime_records?collection=eq.user_roles&doc->>user_id=eq.'+encodeURIComponent(user.id)+'&select=doc');
  const roles=await remote('fc_runtime_records?collection=eq.roles&select=id,doc');
  const admin=assignments.some((a:{doc:{role_id:string}})=>roles.some((r:{id:string;doc:{key:string}})=>r.id===a.doc.role_id&&['ADMIN','SUPERADMIN'].includes(r.doc.key)));
  const query=String(p.query||'').trim();if(query==='@@ALL@@'&&!admin)return reply({message:'Sem permissão.'},403);
  return reply(await remote('rpc/fc_search_users',{p_query:query,p_admin:admin}));
 }catch(e){return reply({message:e instanceof SyntaxError?'JSON inválido.':'Consulta indisponível.'},e instanceof SyntaxError?400:503);}
});
