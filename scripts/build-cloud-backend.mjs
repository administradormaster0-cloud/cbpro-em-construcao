import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
const output='supabase/functions/fc-api';mkdirSync(output,{recursive:true});
process.loadEnvFile('.env.supabase.local');
writeFileSync(output+'/public-config.mjs','export const publicAnonKey='+JSON.stringify(process.env.SUPABASE_ANON_KEY)+';\n');
for(const f of ['db.mjs','query.mjs','ea-cloud.mjs'])copyFileSync('cloud/'+f,output+'/'+f);
const modules=['admin','competition','credits','elo-admin','field-edits','imports','rankings','registrations','rest','rpc','transfers','rpc-response','ea-clubs'];
for(const name of modules){let s=readFileSync('server/'+name+'.mjs','utf8');
 s=s.replace(/import\s*\{\s*randomUUID\s*\}\s*from 'node:crypto';/g,"import {randomUUID} from './db.mjs';");
 s=s.replaceAll('new Date()','new Date(clock())').replaceAll('Date.now()','clock()').replaceAll('Math.random()','stableRandom()');
 s="import {clock,stableRandom,isHydration} from './db.mjs';\n"+s;
 s=s.replaceAll("process.env.FC_CLOUD_AUTH==='true'",'true').replace(/process\.env\.(\w+)/g,"Deno.env.get('$1')");
 if(name==='imports'){s=s.replace("import {register} from './auth.mjs';","const register=()=>{throw Error('Use Supabase Auth.');};").replace('}catch(e){','}catch(e){if(isHydration(e))throw e;');}
 if(name==='rest'){
  const start=s.indexOf('function atom('),end=s.indexOf('const singular=');s=s.slice(0,start)+"export {selectRows} from './db.mjs';\nimport {selectRows,embeddedMatches} from './db.mjs';\n"+s.slice(end);
  const a=s.indexOf('function embeddedMatches('),b=s.indexOf('export function project(',a);s=s.slice(0,a)+s.slice(b);
 }
 if(name==='rankings'){
  s=s.replace('let cachedVersion=-1;const cache=new Map();',"import {requestCache} from './db.mjs';\nconst cache={has:k=>requestCache().has(k),get:k=>requestCache().get(k),set:(k,v)=>requestCache().set(k,v)};");
  s=s.replace("const version=db.prepare('SELECT total_changes() n').get().n;if(cachedVersion!==version){cache.clear();cachedVersion=version;}",'');
 }
 if(name==='rpc'){
  const start=s.indexOf('function escapeLike('),end=s.indexOf('export function invoke(',start);
  s=s.slice(0,start)+`function searchUsers(user,p){if(!user)error('Faça login.',401);const q=String(p.query||'').trim().toLowerCase();if(q==='@@all@@'&&user.role!=='admin')error('Sem permissão.',403);return all('users_profile').filter(r=>q==='@@all@@'||q.length>=2&&(String(r.display_name||r.full_name||'').toLowerCase().includes(q)||(user.role==='admin'&&String(r.email||'').toLowerCase().includes(q)))).slice(0,q==='@@all@@'?10000:20).map(r=>({user_id:r.id,display_name:r.display_name||r.full_name||'',email:user.role==='admin'?r.email:null}));}
function searchEntrants(p){const type=p.type==='player'?'player':'team',rows=all(type==='player'?'player_profiles':'teams').filter(r=>(!p.game_id||!r.game_id||r.game_id===p.game_id)&&(!p.country_id||!r.country_id||r.country_id===p.country_id)),fields=type==='player'?['handle','platform_handle']:['name','tag','eafc_club_name'],found=[],not_found=[];for(const name of [...new Set((p.names||[]).map(String))].slice(0,50)){const q=name.trim().toLowerCase();let selected=rows.filter(r=>fields.some(k=>String(r[k]||'').toLowerCase()===q));if(!selected.length)selected=rows.filter(r=>fields.some(k=>String(r[k]||'').toLowerCase().includes(q)));if(q&&selected.length===1){const r=selected[0];found.push({id:r.id,name:r.name||r.handle||r.tag||name,type});}else not_found.push(name);}return {found,not_found};}
`+s.slice(end);
 }
 s=s.replaceAll('neste servidor local','no backend').replaceAll('neste servidor','no backend');writeFileSync(output+'/'+name+'.mjs',s);
}
console.log('Cloud business modules generated. No filesystem or SQLite runtime dependency.');
