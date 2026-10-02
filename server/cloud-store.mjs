import {randomUUID,createHash} from 'node:crypto';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {db,dataDir} from './db.mjs';
export function createCloudStore({url,key,fetch:fetcher=fetch,cloudOnly=false}){
 let available=false;
 const headers={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};
 async function request(path,options={}){
  for(let attempt=0;attempt<3;attempt++)try{const response=await fetcher(url+'/rest/v1/'+path,{...options,headers:{...headers,...options.headers},signal:AbortSignal.timeout(30000)});const data=await response.json();if(!response.ok)throw Object.assign(new Error(data.message||'Cloud database request failed'),{status:503,code:data.code});return data;}catch(error){if(error.code==='40001'||attempt===2)throw error;await new Promise(r=>setTimeout(r,500*(attempt+1)));}
 }
 const revision=()=>Number(db.prepare("SELECT value FROM meta WHERE key='cloud_revision'").get()?.value||0);
 const setRevision=n=>db.prepare("INSERT INTO meta(key,value) VALUES('cloud_revision',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(String(n));
 async function initialize(){
  const [state]=await request('fc_runtime_state?id=eq.1&select=revision');if(!state?.revision)throw Error('Cloud runtime not initialized');
  if(revision()===Number(state.revision)&&!db.prepare('SELECT 1 FROM cloud_changes LIMIT 1').get()){available=true;return;}
  console.log('Synchronizing cloud revision:',state.revision);
  // The first migration can reuse the locally verified source snapshot.
  // Every collection hash must match; otherwise hydrate from the cloud.
  const reportPath=resolve(dataDir,'supabase-setup-report.json');let baseline=false;
  if(!cloudOnly&&!revision()&&Number(state.revision)===1&&existsSync(reportPath)){
   const report=JSON.parse(readFileSync(reportPath,'utf8'));
   baseline=report.complete&&report.tables.every(t=>{const hash=createHash('sha256');let count=0;const scan=t.local_count>10000?' NOT INDEXED':'';for(const {doc}of db.prepare('SELECT doc FROM records'+scan+' WHERE collection=? ORDER BY id').all(t.table)){hash.update(doc);count++;}return count===t.local_count&&hash.digest('hex')===t.source_sha256;});
   const total=db.prepare('SELECT count(*) n FROM records').get().n;baseline=baseline&&total===report.tables.reduce((n,t)=>n+t.local_count,0);
  }
  if(!baseline){
   // Download first into an isolated table. A failed network request cannot erase
   // the working cache. The revision check prevents a mixed snapshot.
   db.exec('CREATE TABLE IF NOT EXISTS cloud_download(collection TEXT,id TEXT,doc TEXT,PRIMARY KEY(collection,id)); DELETE FROM cloud_download;');
   const insert=db.prepare('INSERT INTO cloud_download VALUES(?,?,?)');let offset=0;
   for(;;){const rows=await request('fc_runtime_records?select=collection,id,doc&order=collection.asc,id.asc&limit=500&offset='+offset);db.exec('BEGIN IMMEDIATE');try{for(const row of rows)insert.run(row.collection,row.id,JSON.stringify(row.doc));db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}offset+=rows.length;if(offset%10000===0)console.log('Cloud cache synchronized:',offset);if(rows.length<500)break;}
   const [latest]=await request('fc_runtime_state?id=eq.1&select=revision');if(latest.revision!==state.revision)throw Error('Cloud changed during download; restart to retry.');
   db.exec('BEGIN IMMEDIATE');try{db.exec('DELETE FROM records;INSERT INTO records SELECT * FROM cloud_download;DELETE FROM cloud_changes;');setRevision(state.revision);db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
  }else {setRevision(state.revision);db.exec('DELETE FROM cloud_changes');}
  available=true;
 }
 async function mutate(fn){
  // Check the authoritative revision before every request. Never serve a stale
  // local snapshot when the remote database is unavailable or has changed.
  if(cloudOnly)await initialize();
  if(!available)throw Object.assign(new Error('Banco em recuperação. Reinicie o servidor para sincronizar.'),{status:503});
  db.exec('BEGIN IMMEDIATE');let sent=false;
  try{
   const result=await fn();const changes=new Map();for(const row of db.prepare('SELECT * FROM cloud_changes ORDER BY sequence').all())changes.set(row.collection+':'+row.record_id,{collection:row.collection,id:row.record_id,action:row.action,...(row.doc?{doc:JSON.parse(row.doc)}:{})});
   if(changes.size){sent=true;const response=await request('rpc/fc_runtime_commit',{method:'POST',body:JSON.stringify({p_operation:randomUUID(),p_revision:revision(),p_changes:[...changes.values()]})});setRevision(response.revision);db.exec('DELETE FROM cloud_changes');}
   db.exec('COMMIT');return result;
  }catch(error){db.exec('ROLLBACK');if(sent)available=false;throw error;}
 }
 return {initialize,mutate,status:()=>({available,revision:revision(),provider:'supabase',cache:cloudOnly?'memory':'sqlite',local_database_reads:!cloudOnly})};
}
