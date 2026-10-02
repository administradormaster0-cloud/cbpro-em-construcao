import {emailLoginPage} from './email-login-page.mjs';
import http from 'node:http';
import {createCloudAuth} from './cloud-auth.mjs';
import {createCloudStore} from './cloud-store.mjs';
import {assetLookupName} from './assets.mjs';
import { readFileSync,existsSync,readdirSync,statSync,createReadStream,appendFileSync,writeFileSync,mkdirSync } from 'node:fs';
import { resolve,extname,basename,sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { WebSocketServer } from 'ws';
import { db,dataDir,all,get,save,where,log } from './db.mjs';
import { rest,project,privateTables } from './rest.mjs';
import { authenticate,bootstrap,login,register,refresh,session,publicUser,hash,requestRecovery,requestMagicLink,updateAccount,safeAppRedirect } from './auth.mjs';
import { searchEaClubs } from './ea-clubs.mjs';
import { createCompetition,generatePlayoffs,recordResult,transferPlayer,generateExistingStage } from './competition.mjs';
import { adaptOriginalFrontend } from './frontend-compat.mjs';
import { adminUsers } from './admin.mjs';
import { rpc,invoke } from './rpc.mjs';
import { repairEloCatalog } from './elo-admin.mjs';
import { paginateRpc } from './rpc-response.mjs';
import { allowOrigin, withQuery } from './request-guards.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url)),site=resolve(root,'site'),dist=resolve(root,'fcclubs/dist'),port=Number(process.env.PORT||3000),host=process.env.HOST||'127.0.0.1';
if(process.env.FC_CLOUD_STORE!=='true'){bootstrap();repairEloCatalog();}
const cloudEnv=resolve(root,'fcclubs/.env.supabase.local');if(existsSync(cloudEnv))process.loadEnvFile(cloudEnv);
const cloudAuth=process.env.FC_CLOUD_AUTH==='true'?createCloudAuth({url:process.env.SUPABASE_URL,key:process.env.SUPABASE_ANON_KEY}):null;
const cloudStore=process.env.FC_CLOUD_STORE==='true'?createCloudStore({url:process.env.SUPABASE_URL,key:process.env.SUPABASE_SERVICE_ROLE_KEY,cloudOnly:true}):null;
if(cloudStore)await cloudStore.initialize();
const requestToken=req=>req.headers.authorization?.replace(/^Bearer /i,'')||req.headers.cookie?.match(/(?:^|;\s*)fc_session=([^;]+)/)?.[1];
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.gif':'image/gif','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.ico':'image/x-icon','.wasm':'application/wasm','.glb':'model/gltf-binary'};
const assets=new Map();for(const dir of ['assets/img','assets/fonts','assets/files','js','css'])if(existsSync(resolve(site,dir)))for(const name of readdirSync(resolve(site,dir))){assets.set(name,resolve(site,dir,name));assets.set(name.replace(/\.[a-z0-9]+(?=\.[^.]+$)/,''),resolve(site,dir,name));}
const imageAssets=new Map();for(const [name,file]of assets){if(!/[.](png|jpe?g|webp|gif|svg|avif)$/i.test(file))continue;const key=assetLookupName(name),old=imageAssets.get(key);if(!old||statSync(file).size>statSync(old).size)imageAssets.set(key,file);}
const bundles=new Map();
const missingStorage=new Set();
const origin=req=>`http://${req.headers.host||'localhost:'+port}`;
function localize(value,req){if(typeof value==='string')return value.replaceAll('https://pkoysigjsorpefekkiqf.supabase.co',origin(req)+'/backend').replaceAll('https://bjgfpygzmosxahvcqrwe.supabase.co',origin(req)+'/backend');if(Array.isArray(value))return value.map(v=>localize(v,req));if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,localize(v,req)]));return value;}
function json(res,status,data,headers={}){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers});res.end(JSON.stringify(data));}
async function body(req){let bytes=0,parts=[];for await(const part of req){bytes+=part.length;if(bytes>5e6)throw Object.assign(new Error('Arquivo excede 5 MB.'),{status:413});parts.push(part);}const raw=Buffer.concat(parts);if(req.headers['content-type']?.includes('application/json')){try{return raw.length?JSON.parse(raw):{};}catch{throw Object.assign(new Error('JSON inválido.'),{status:400});}}return raw;}
function requireAdmin(user){if(!user)throw Object.assign(new Error('Faça login.'),{status:401});if(user.role!=='admin')throw Object.assign(new Error('Acesso administrativo necessário.'),{status:403});}
const attempts=new Map();
function limitLogin(req){const key=req.socket.remoteAddress,old=attempts.get(key),entry=old&&old.until>Date.now()?old:{n:0,until:Date.now()+60e3};entry.n++;attempts.set(key,entry);if(entry.n>15)throw Object.assign(new Error('Muitas tentativas. Aguarde um minuto.'),{status:429});}
async function handleRequest(req,res){
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','SAMEORIGIN');
 const url=new URL(req.url,'http://localhost'),path=decodeURIComponent(url.pathname);let user=cloudAuth?null:authenticate(req);
 try{
  if(!user&&cloudAuth&&requestToken(req)&&/^\/(api\/|backend\/(auth|rest|functions|storage)\/)/.test(path))user=await cloudAuth.authenticate(requestToken(req));
  if(!allowOrigin(req.headers.origin,req.headers.host||'localhost:'+port))throw Object.assign(new Error('Origem não autorizada.'),{status:403});
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info,prefer,range','Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,PUT,HEAD'});return res.end();}
  if(path==='/login-code'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end(emailLoginPage());}
  if(path==='/api/health')return json(res,200,{ok:true,storage:cloudStore?'supabase':'sqlite',persistence:cloudStore?.status()||null,mode:cloudStore?'cloud-data-local-server':'local',authentication:cloudAuth?'supabase':'local',version:2});
  if(path==='/api/session')return json(res,200,{user:user?{...publicUser(user),local_role:user.role}:null});
  if(path==='/api/login'&&req.method==='POST'){limitLogin(req);const p=await body(req),s=cloudAuth?await cloudAuth.login(p.email,p.password):login(p.email,p.password);return json(res,200,{user:s.user},{'Set-Cookie':`fc_session=${s.access_token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400`});}
  if(path==='/api/logout'&&req.method==='POST'){const token=req.headers.cookie?.match(/(?:^|;\s*)fc_session=([^;]+)/)?.[1];if(token&&cloudAuth&&token.split('.').length===3)await cloudAuth.logout(token);if(token)db.prepare('DELETE FROM sessions WHERE token=?').run(hash(token));return json(res,200,{ok:true},{'Set-Cookie':'fc_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'});}
  if(path==='/api/stats')return json(res,200,{collections:db.prepare('SELECT collection name,count(*) count FROM records GROUP BY collection').all(),missing_transfer_history:!db.prepare("SELECT 1 FROM records WHERE collection='transfer_logs' LIMIT 1").get()});
  if(path==='/api/import-report'){requireAdmin(user);return json(res,200,cloudStore?get('fc_system_reports','import'):JSON.parse(readFileSync(resolve(dataDir,'import-report.json'),'utf8')));}
  if(path==='/api/audit'){requireAdmin(user);return json(res,200,cloudStore?all('fc_audit').sort((a,b)=>b.created_at.localeCompare(a.created_at)).slice(0,100):db.prepare('SELECT * FROM audit ORDER BY id DESC LIMIT 100').all());}
  if(path==='/api/competitions'&&req.method==='POST'){requireAdmin(user);return json(res,201,createCompetition(user,await body(req)));}
  const generateStage=path.match(/^\/api\/stages\/([^/]+)\/generate$/);if(generateStage&&req.method==='POST'){if(!user)throw Object.assign(new Error('Faça login.'),{status:401});return json(res,201,generateExistingStage(user,generateStage[1],await body(req)));}
  const playoff=path.match(/^\/api\/competitions\/([^/]+)\/playoffs$/);if(playoff&&req.method==='POST'){requireAdmin(user);return json(res,201,generatePlayoffs(user,playoff[1],await body(req)));}
  const score=path.match(/^\/api\/matches\/([^/]+)\/result$/);if(score&&req.method==='POST'){requireAdmin(user);return json(res,200,recordResult(user,score[1],await body(req)));}
  if(path==='/api/transfers'&&req.method==='POST'){requireAdmin(user);const p=await body(req);return json(res,201,transferPlayer(user,p.player_profile_id,p.to_team_id,p.reason));}
  if(path.startsWith('/backend/auth/v1/')){
   const action=path.slice('/backend/auth/v1/'.length),p=req.method==='GET'?{}:await body(req);
   if(cloudAuth){
    if(action==='settings')return json(res,200,await cloudAuth.settings());
    if(action==='token'){limitLogin(req);return json(res,200,url.searchParams.get('grant_type')==='refresh_token'?await cloudAuth.refresh(p.refresh_token):await cloudAuth.login(p.email,p.password));}
    if(action==='signup'){limitLogin(req);return json(res,200,await cloudAuth.signup(p));}
    if(action==='recover'){limitLogin(req);return json(res,200,await cloudAuth.recover(p.email));}
    if(action==='user'&&req.method==='PUT'){if(!user||!user.cloud_user)return json(res,401,{message:'Faça login novamente para atualizar sua conta.'});return json(res,200,await cloudAuth.update(requestToken(req),p));}
    if(action==='user'&&user?.cloud_user)return json(res,200,user.cloud_user);
    if(action==='logout'&&requestToken(req)?.split('.').length===3)return json(res,200,await cloudAuth.logout(requestToken(req)));
    if(action==='otp'){limitLogin(req);if(p.phone&&!p.email)return json(res,501,{message:'Envio por SMS nao esta configurado neste servidor.'});return json(res,200,await cloudAuth.otp(p.email,safeAppRedirect(url.searchParams.get('redirect_to'),req.headers.host,'/'),p.create_user!==false));}
    if(action==='verify'){limitLogin(req);return json(res,200,await cloudAuth.verifyOtp(p.email,p.token,p.type));}
   }
   if(action==='token'){limitLogin(req);return json(res,200,url.searchParams.get('grant_type')==='refresh_token'?refresh(p.refresh_token):login(p.email,p.password));}
   if(action==='signup'){limitLogin(req);return json(res,200,session(register(p.email,p.password,p.data?.display_name||p.data?.gamertag)));}
   if(action==='user'&&req.method==='PUT'){if(!user)return json(res,401,{message:'Sessão inválida'});return json(res,200,updateAccount(user,p));}
   if(action==='user'){if(!user)return json(res,401,{message:'Sessão inválida'});return json(res,200,publicUser(user));}
   if(action==='recover'){limitLogin(req);await requestRecovery(p.email,safeAppRedirect(url.searchParams.get('redirect_to'),req.headers.host,'/reset-password'));return json(res,200,{});}
   if(action==='otp'){limitLogin(req);if(p.phone&&!p.email)return json(res,501,{message:'Envio por SMS não está configurado neste servidor.'});await requestMagicLink(p.email,safeAppRedirect(url.searchParams.get('redirect_to'),req.headers.host,'/'),p.create_user!==false);return json(res,200,{});}
   if(action==='logout'){const token=req.headers.authorization?.replace(/^Bearer /i,'');if(token)db.prepare('DELETE FROM sessions WHERE token=?').run(hash(token));return json(res,200,{});}
   if(action==='settings')return json(res,200,{external:{email:true},disable_signup:false,mailer_autoconfirm:true});
   return json(res,503,{message:'Configure um provedor de e-mail/OAuth para esta operação.'});
  }
  if(path.startsWith('/backend/rest/v1/rpc/')){const name=path.split('/').at(-1),result=paginateRpc(rpc(name,await body(req),user),url.searchParams,req.headers.range);return json(res,200,localize(result.data,req),result.headers);}
  if(path.startsWith('/backend/functions/v1/admin-users')){const parts=path.slice('/backend/functions/v1/admin-users'.length).split('/').filter(Boolean);return json(res,200,adminUsers(user,parts,req.method,req.method==='GET'?{}:await body(req),url.searchParams));}
  if(path.startsWith('/backend/functions/v1/')){const name=path.split('/').at(-1);const payload=withQuery(req.method==='GET'||req.method==='HEAD'?{}:await body(req),url.searchParams);if(name==='search-ea-clubs')return json(res,200,await searchEaClubs(payload.name||payload.clubName||''));if(cloudStore&&['search-users','search-tournament-entrants'].includes(name)){const response=await fetch(process.env.SUPABASE_URL+'/functions/v1/'+name,{method:'POST',headers:{apikey:process.env.SUPABASE_ANON_KEY,'Content-Type':'application/json',...(requestToken(req)?{Authorization:'Bearer '+requestToken(req)}:{})},body:JSON.stringify(payload),signal:AbortSignal.timeout(25000)});return json(res,response.status,await response.json());}return json(res,200,localize(invoke(name,payload,user),req));}
  if(path.startsWith('/backend/rest/v1/')){
   const table=path.split('/').at(-1);const range=req.headers.range?.match(/(\d+)-(\d+)/);if(range){url.searchParams.set('offset',range[1]);url.searchParams.set('limit',Number(range[2])-Number(range[1])+1);}
   const result=rest(table,req.method,url.searchParams,['POST','PATCH'].includes(req.method)?await body(req):{},user,req.headers);let data=result.data;
   if(req.headers.accept?.includes('vnd.pgrst.object')){if(data.length!==1)return json(res,406,{code:'PGRST116',message:'JSON object requested, multiple (or no) rows returned',details:`The result contains ${data.length} rows`});data=data[0];}
   const headers={'Content-Range':result.count?`${result.offset}-${result.offset+result.data.length-1}/${result.count}`:'*/0','Access-Control-Expose-Headers':'Content-Range'};
   if(req.method==='HEAD'){res.writeHead(200,headers);return res.end();}if(!['GET','HEAD'].includes(req.method)){if(res.pendingBroadcasts)res.pendingBroadcasts.push([table,result.data,req.method]);else broadcast(table,result.data,req.method);}
   return json(res,req.method==='POST'?201:200,localize(data,req),headers);
  }
  if(path.startsWith('/backend/storage/v1/object/')&&['POST','PUT'].includes(req.method)){
   if(!user)throw Object.assign(new Error('Faça login.'),{status:401});const key=path.slice('/backend/storage/v1/object/'.length);if(!/^[a-z0-9_-]+\/[\w./-]+$/i.test(key)||key.includes('..'))throw Object.assign(new Error('Caminho inválido'),{status:400});if(user.role!=='admin'&&!key.split('/').includes(user.id))throw Object.assign(new Error('Use sua pasta de usuário.'),{status:403});
   const allowed=['image/png','image/jpeg','image/webp'];if(!allowed.includes(req.headers['content-type']?.split(';')[0])||!/[.](png|jpe?g|webp)$/i.test(key))throw Object.assign(new Error('Use PNG, JPEG ou WebP.'),{status:400});const bytes=await body(req),filename=resolve(dataDir,'uploads',key);
   if(cloudStore){const remote=await fetch(process.env.SUPABASE_URL+'/storage/v1/object/'+key.split('/').map(encodeURIComponent).join('/'),{method:req.method,headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':req.headers['content-type'],'x-upsert':req.headers['x-upsert']||'false'},body:bytes,signal:AbortSignal.timeout(25000)});if(!remote.ok){const detail=await remote.json();throw Object.assign(new Error(detail.message||'Falha ao enviar imagem ao Supabase.'),{status:remote.status>=500?503:remote.status});}}
   if(!cloudStore){mkdirSync(resolve(filename,'..'),{recursive:true});writeFileSync(filename,bytes);}return json(res,200,{Key:key,Id:randomUUID()});
  }
  if(path.startsWith('/backend/storage/v1/')&&cloudStore){const remote=process.env.SUPABASE_URL+path.slice('/backend'.length)+url.search;res.writeHead(307,{Location:remote,'Cache-Control':'no-store'});return res.end();}
  if(path.startsWith('/backend/storage/v1/')){const key=path.replace(/^\/backend\/storage\/v1\/(?:object|render\/image)\/(?:public|sign)\//,'');const uploaded=resolve(dataDir,'uploads',key);if(uploaded.startsWith(resolve(dataDir,'uploads')+sep)&&existsSync(uploaded))return sendFile(uploaded,req,res);const asset=imageAssets.get(assetLookupName(key))||assets.get(basename(key));if(asset)return sendFile(asset,req,res);if(!missingStorage.has(key)){missingStorage.add(key);appendFileSync(resolve(dataDir,'missing-media.ndjson'),JSON.stringify({key,at:new Date().toISOString()})+'\n');}res.writeHead(404,{'Content-Type':'image/svg+xml'});return res.end('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="16" fill="#12191a"/><path d="M48 18 72 28v21c0 14-24 29-24 29S24 63 24 49V28Z" fill="none" stroke="#25e146" stroke-width="3"/></svg>');}
  if(path.startsWith('/manage')){const relative=path.slice('/manage'.length)||'/manage.html',file=resolve(dist,'.'+relative);if(file.startsWith(dist+sep)&&existsSync(file)&&statSync(file).isFile())return sendFile(file,req,res);return sendFile(resolve(dist,'manage.html'),req,res);}
  const staticPath=resolve(site,'.'+path);if(staticPath.startsWith(site+sep)&&existsSync(staticPath)&&statSync(staticPath).isFile()&&!path.endsWith('.html')&&!path.endsWith('.md')&&!path.endsWith('.cmd'))return sendFile(staticPath,req,res);
  if(path.startsWith('/assets/')){const file=assets.get(basename(path));if(file)return sendFile(file,req,res);return json(res,404,{message:'Asset não incluído no pacote.'});}
  const html=readFileSync(resolve(site,'index.html'),'utf8').replace(/<script data-sitecloner[^>]*>[\s\S]*?<\/script>/g,'').replace(/(src|href)="(js\/|css\/|assets\/)/g,'$1="/$2').replace('<head>','<head><base href="/"><script>try{if(!localStorage.getItem("i18nextLng"))localStorage.setItem("i18nextLng","pt-BR")}catch{}</script>');
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});res.end(html.replace('</body>',"<script>new MutationObserver(()=>{if(location.pathname!=='/login'||document.getElementById('fc-email-login-link'))return;const f=document.querySelector('form');if(f){const a=document.createElement('a');a.id='fc-email-login-link';a.href='/login-code';a.textContent='Entrar com código por e-mail';a.style.cssText='display:block;text-align:center;margin:16px 0;color:#46e674';f.after(a)}}).observe(document.documentElement,{childList:true,subtree:true});</script>"+'</body>'));
 }catch(e){const status=e.status||500;if(status>=500)appendFileSync(resolve(dataDir,'server-errors.log'),new Date().toISOString()+' '+path+' '+e.message+'\n');const payload={message:e.message,error:e.message,code:status===500?'LOCAL_ERROR':String(status)};if(e.provider_status)payload.provider_status=e.provider_status;if(e.provider_code)payload.provider_code=e.provider_code;json(res,status,payload);}
}
let requestQueue=Promise.resolve();
const server=http.createServer((req,res)=>{
 if(!cloudStore||!/^\/(api\/|backend\/(auth|rest|functions)\/|backend\/storage\/.*)/.test(req.url)||(/\/storage\//.test(req.url)&&['GET','HEAD'].includes(req.method)))return handleRequest(req,res);
 const run=async()=>{const buffered={status:200,headers:{},payload:'',pendingBroadcasts:[],setHeader(k,v){this.headers[k]=v;},writeHead(status,headers={}){this.status=status;Object.assign(this.headers,headers);},end(value=''){this.payload=value;}};
  try{await cloudStore.mutate(async()=>{await handleRequest(req,buffered);if(buffered.status>=400)throw Object.assign(new Error('Request rejected'),{buffered:true});});res.writeHead(buffered.status,buffered.headers);res.end(buffered.payload);for(const args of buffered.pendingBroadcasts)broadcast(...args);}
  catch(error){if(error.buffered){res.writeHead(buffered.status,buffered.headers);res.end(buffered.payload);}else json(res,error.status||503,{message:'Não foi possível confirmar a gravação no Supabase. '+error.message});}
 };requestQueue=requestQueue.then(run,run);
});
server.requestTimeout=30000;
function sendFile(file,req,res){if(!existsSync(file))return json(res,503,{message:'Execute npm run build para preparar o painel.'});const ext=extname(file).toLowerCase();if(ext==='.js'){const key=file+'|'+origin(req);let text=bundles.get(key);if(!text){text=adaptOriginalFrontend(readFileSync(file,'utf8')).replaceAll('https://pkoysigjsorpefekkiqf.supabase.co',origin(req)+'/backend').replaceAll('https://bjgfpygzmosxahvcqrwe.supabase.co',origin(req)+'/backend').replaceAll('sb_publishable_UANCv-yxe0ndcLf13IbuMg_o4F1meIo','local-public-key');bundles.set(key,text);}res.writeHead(200,{'Content-Type':mime[ext],'Cache-Control':'no-cache'});return res.end(text);}res.writeHead(200,{'Content-Type':mime[ext]||(existsSync(file+'.mime')&&/^image\/[a-z0-9.+-]+$/.test(readFileSync(file+'.mime','utf8'))?readFileSync(file+'.mime','utf8'):'application/octet-stream'),'Cache-Control':ext==='.html'?'no-cache':'public,max-age=3600'});createReadStream(file).pipe(res);}
const ws=new WebSocketServer({server,path:'/backend/realtime/v1/websocket'});
ws.on('connection',socket=>{socket.topics=new Map();socket.on('message',raw=>{try{const m=JSON.parse(String(raw));if(m.event==='phx_join'){socket.topics.set(m.topic,m.payload?.config?.postgres_changes||[]);socket.send(JSON.stringify({topic:m.topic,event:'phx_reply',ref:m.ref,payload:{status:'ok',response:{postgres_changes:(m.payload?.config?.postgres_changes||[]).map((x,i)=>({...x,id:i}))}}}));}else if(m.event==='heartbeat'||m.event==='phx_leave')socket.send(JSON.stringify({topic:m.topic,event:'phx_reply',ref:m.ref,payload:{status:'ok',response:{}}}));}catch{}});});
function broadcast(table,rows,method){if(privateTables.has(table))return;for(const socket of ws.clients)for(const [topic,subscriptions]of socket.topics||[])for(const sub of subscriptions){if(sub.table!==table)continue;for(const row of rows){if(sub.filter){const [field,filter]=sub.filter.split('=');if(filter?.startsWith('eq.')&&String(row[field])!==filter.slice(3))continue;}socket.send(JSON.stringify({topic,event:'postgres_changes',payload:{ids:[subscriptions.indexOf(sub)],data:{schema:'public',table,type:{POST:'INSERT',PATCH:'UPDATE',DELETE:'DELETE'}[method],record:method==='DELETE'?{}:row,old_record:method==='DELETE'?row:{},commit_timestamp:new Date().toISOString()}}}));}}}
server.listen(port,host,()=>console.log(`FC Clubs: http://localhost:${port}\nPainel: http://localhost:${port}/manage/\nAutenticação: ${cloudAuth?'Supabase Auth':'local'}`));
