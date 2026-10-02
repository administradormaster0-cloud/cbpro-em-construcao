// Provisions a protected staging copy. The running SQLite backend is unchanged.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
process.loadEnvFile(fileURLToPath(new URL('../.env.supabase.local',import.meta.url)));
const ref=process.env.SUPABASE_PROJECT_REF,base=process.env.SUPABASE_URL;
if(!/^[a-z]{20}$/.test(ref)||base!==`https://${ref}.supabase.co`)throw Error('Invalid project configuration');
const db=new DatabaseSync(fileURLToPath(new URL('../data/fcclubs.sqlite',import.meta.url)),{readOnly:true});
const directory=fileURLToPath(new URL('../supabase/',import.meta.url));mkdirSync(directory,{recursive:true});
const reportPath=fileURLToPath(new URL('../data/supabase-setup-report.json',import.meta.url));
const report={project:ref,started_at:new Date().toISOString(),mode:'protected-staging',tables:[],complete:false};
const previous=existsSync(reportPath)?JSON.parse(readFileSync(reportPath,'utf8')):null;
const ident=s=>{if(!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s))throw Error('Invalid identifier');return '"'+s+'"';};
async function request(url,options){for(let attempt=0;attempt<5;attempt++){try{const response=await fetch(url,{...options,signal:AbortSignal.timeout(45000)});if(response.ok){const text=await response.text();return text?JSON.parse(text):null;}if([429,502,503,504].includes(response.status)&&attempt<4){await new Promise(r=>setTimeout(r,2000*(attempt+1)));continue;}const body=await response.json().catch(()=>({}));throw Error(`HTTP ${response.status}: ${body.code||body.message||'request failed'}`);}catch(error){if(attempt===4||String(error.message).startsWith('HTTP'))throw error;console.log('Retrying interrupted network request.');await new Promise(r=>setTimeout(r,2000*(attempt+1)));}} }
const query=sql=>request(`https://api.supabase.com/v1/projects/${ref}/database/query`,{method:'POST',headers:{Authorization:`Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({query:sql})});
const collections=db.prepare('select collection,count(*) n from records group by collection order by collection').all();
const source=readFileSync(fileURLToPath(new URL('../../reverse_engineering/schema.sql',import.meta.url)),'utf8');
// Known empty tables are retained, but inferred NOT NULL/FKs must not be treated
// as original constraints. Access stays closed until the ownership policies exist.
const known=new Map([...source.matchAll(/CREATE TABLE IF NOT EXISTS (\w+) \(([\s\S]*?)\n\);/g)].map(m=>[m[1],m[2]]));
const metadata=[];
for(const {collection,n} of collections){
 const columns=new Map();
 for(const {doc} of db.prepare('select doc from records where collection=?').iterate(collection))for(const [key,value] of Object.entries(JSON.parse(doc))){
  if(!columns.has(key))columns.set(key,new Set());if(value!==null)columns.get(key).add(typeof value==='object'?'jsonb':typeof value==='boolean'?'boolean':typeof value==='number'?'numeric':'text');
 }
 const definitions=[...columns].map(([name,types])=>({name,type:types.size===1?[...types][0]:types.size===0?'text':'jsonb'}));
 metadata.push({table:collection,count:n,columns:definitions});
 known.delete(collection);
}
let sql='-- Staging schema reconstructed from available local data; not original server source.\nBEGIN;\n';
for(const {table,columns} of metadata){sql+=`CREATE TABLE IF NOT EXISTS public.${ident(table)} (${columns.map(c=>`${ident(c.name)} ${c.type}${c.name==='id'?' PRIMARY KEY':''}`).join(',')});\n`;}
for(const [table,definition] of known)sql+=`CREATE TABLE IF NOT EXISTS public.${ident(table)} (${definition.replace(/ NOT NULL/g,'')});\n`;
for(const table of [...metadata.map(m=>m.table),...known.keys()])sql+=`ALTER TABLE public.${ident(table)} ENABLE ROW LEVEL SECURITY;\nREVOKE ALL ON public.${ident(table)} FROM anon,authenticated;\nGRANT ALL ON public.${ident(table)} TO service_role;\n`;
sql+='COMMIT;\nNOTIFY pgrst, \'reload schema\';';
writeFileSync(directory+'staging-schema.sql',sql);
writeFileSync(directory+'staging-columns.json',JSON.stringify(metadata,null,2));
await query(sql);console.log(`Protected schema applied: ${metadata.length+known.size} tables.`);
await new Promise(r=>setTimeout(r,1500));
for(const meta of metadata){
 const table=meta.table;let batch=[],bytes=0,uploaded=0;const hash=createHash('sha256');
 const old=previous?.project===ref&&previous.tables.find(t=>t.table===table);
 if(old){const current=createHash('sha256');for(const {doc} of db.prepare('select doc from records where collection=? order by id').iterate(table))current.update(doc);
  if(current.digest('hex')===old.source_sha256){const [remote]=await query(`SELECT count(*)::integer AS count FROM public.${ident(table)}`);if(remote.count===meta.count){report.tables.push(old);writeFileSync(reportPath,JSON.stringify(report,null,2));console.log(`${table}: existing import verified.`);continue;}}
 }
 async function flush(){if(!batch.length)return;await request(`${base}/rest/v1/${table}?on_conflict=id`,{method:'POST',headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(batch)});uploaded+=batch.length;batch=[];bytes=0;}
 for(const {doc} of db.prepare('select doc from records where collection=? order by id').iterate(table)){
  hash.update(doc);const row=JSON.parse(doc);const normalized=Object.fromEntries(meta.columns.map(c=>[c.name,row[c.name]??null]));const size=Buffer.byteLength(JSON.stringify(normalized));
  if(batch.length&&(bytes+size>1000000||batch.length>=500))await flush();batch.push(normalized);bytes+=size;
 }
 await flush();
 const [remote]=await query(`SELECT count(*)::integer AS count FROM public.${ident(table)}`);
 if(remote.count!==meta.count)throw Error(`Count mismatch in ${table}: ${remote.count}/${meta.count}`);
 report.tables.push({table,local_count:meta.count,remote_count:remote.count,source_sha256:hash.digest('hex')});writeFileSync(reportPath,JSON.stringify(report,null,2));
 console.log(`${table}: ${uploaded} records verified.`);
}
report.complete=true;report.finished_at=new Date().toISOString();writeFileSync(reportPath,JSON.stringify(report,null,2));db.close();
console.log('Protected staging import completed. Runtime cutover is not enabled.');
