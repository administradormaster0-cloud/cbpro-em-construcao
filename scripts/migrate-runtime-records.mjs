import { DatabaseSync } from 'node:sqlite';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
process.loadEnvFile('.env.supabase.local');
const project=process.env.SUPABASE_PROJECT_REF;
const headers={Authorization:'Bearer '+process.env.SUPABASE_ACCESS_TOKEN,'Content-Type':'application/json'};
async function query(sql){
 for(let attempt=0;;attempt++){
  try{const r=await fetch(`https://api.supabase.com/v1/projects/${project}/database/query`,{method:'POST',headers,body:JSON.stringify({query:sql}),signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error('Database HTTP '+r.status);return await r.json();}
  catch(e){if(attempt>=3)throw e;await new Promise(r=>setTimeout(r,1000*(attempt+1)));}
 }
}
await query(readFileSync('supabase/runtime.sql','utf8'));
const [state]=await query('select revision from public.fc_runtime_state where id=1');
if(Number(state.revision)!==0)throw Error('Runtime is already active; refusing to overwrite cloud records.');
const db=new DatabaseSync('data/fcclubs.sqlite',{readOnly:true});
db.exec('BEGIN');
const report={project,started_at:new Date().toISOString(),complete:false,tables:[]};
const previous=existsSync('data/runtime-migration-report.json')?JSON.parse(readFileSync('data/runtime-migration-report.json','utf8')):null;
const literal=s=>"'"+String(s).replaceAll("'","''")+"'";
for(const {collection} of db.prepare('select distinct collection from records order by collection').all()){
 let batch=[],bytes=0,count=0;const hash=createHash('sha256');const pending=[];
 const old=previous?.project===project&&previous.tables.find(t=>t.collection===collection);
 if(old){const h=createHash('sha256');for(const row of db.prepare('select doc from records where collection=? order by id').iterate(collection))h.update(JSON.stringify(JSON.parse(row.doc)));const [remote]=await query('select count(*)::integer n from public.fc_runtime_records where collection='+literal(collection));if(h.digest('hex')===old.source_sha256&&remote.n===old.count){report.tables.push(old);console.log(collection+': resumed verified');continue;}}
 async function upload(rows){for(let attempt=0;;attempt++)try{
  const r=await fetch(process.env.SUPABASE_URL+'/rest/v1/fc_runtime_records?on_conflict=collection,id',{method:'POST',headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(rows),signal:AbortSignal.timeout(60000)});
  if(!r.ok)throw Error('Record upload HTTP '+r.status);await r.arrayBuffer();return;
 }catch(e){if(attempt>=3)throw e;await new Promise(r=>setTimeout(r,1000*(attempt+1)));}}
 async function flush(){if(!batch.length)return;pending.push(upload(batch).then(()=>({ok:true}),error=>({error})));batch=[];bytes=0;if(pending.length>=4){const results=await Promise.all(pending.splice(0));for(const r of results)if(r.error)throw r.error;}}
 for(const row of db.prepare('select id,doc from records where collection=? order by id').iterate(collection)){
  const doc=JSON.stringify(JSON.parse(row.doc));hash.update(doc);count++;
  if(batch.length&&(bytes+Buffer.byteLength(doc)>1000000||batch.length>=500))await flush();
  batch.push({collection,id:row.id,doc:JSON.parse(doc)});bytes+=Buffer.byteLength(doc);
 }
 await flush();
 for(const r of await Promise.all(pending))if(r.error)throw r.error;
 const [remote]=await query('select count(*)::integer n from public.fc_runtime_records where collection='+literal(collection));
 if(remote.n!==count)throw Error('Count mismatch: '+collection);
 report.tables.push({collection,count,source_sha256:hash.digest('hex')});
 writeFileSync('data/runtime-migration-report.json',JSON.stringify(report,null,2));
 console.log(collection+': '+count+' verified');
}
await query('update public.fc_runtime_state set revision=1 where id=1 and revision=0');
db.exec('COMMIT');db.close();report.complete=true;report.finished_at=new Date().toISOString();
writeFileSync('data/runtime-migration-report.json',JSON.stringify(report,null,2));
console.log('Cloud import complete.');
