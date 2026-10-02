import {readdirSync,readFileSync,statSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,relative,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
process.loadEnvFile(fileURLToPath(new URL('../.env.supabase.local',import.meta.url)));
const root=fileURLToPath(new URL('../data/uploads/',import.meta.url)),reportPath=fileURLToPath(new URL('../data/supabase-media-report.json',import.meta.url));
const previous=existsSync(reportPath)?JSON.parse(readFileSync(reportPath,'utf8')):null;
if(previous&&previous.project!==process.env.SUPABASE_PROJECT_REF)writeFileSync(reportPath+'.'+previous.project+'.bak',JSON.stringify(previous,null,2));
const report=previous?.project===process.env.SUPABASE_PROJECT_REF?previous:{project:process.env.SUPABASE_PROJECT_REF,files:{}};
const types={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.svg':'image/svg+xml','.avif':'image/avif'};
const mediaType=file=>types[extname(file).toLowerCase()]||(existsSync(file+'.mime')?readFileSync(file+'.mime','utf8'):null);
const files=[];function walk(dir){for(const f of readdirSync(dir,{withFileTypes:true})){const path=resolve(dir,f.name);if(f.isDirectory())walk(path);else if(!path.endsWith('.mime')&&mediaType(path))files.push(path);}}walk(root);
let index=0,done=0;const headers={apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`};
async function worker(){while(index<files.length){const file=files[index++],key=relative(root,file).replaceAll('\\','/'),size=statSync(file).size;
 const bytes=readFileSync(file),hash=createHash('sha256').update(bytes).digest('hex');
 if(report.files[key]?.sha256===hash){done++;continue;}
 const url=process.env.SUPABASE_URL+'/storage/v1/object/'+key.split('/').map(encodeURIComponent).join('/');
 let success=false;for(let attempt=0;attempt<4;attempt++){
  const r=await fetch(url,{method:'POST',headers:{...headers,'Content-Type':mediaType(file),'x-upsert':'true'},body:bytes,signal:AbortSignal.timeout(120000)});
  if(r.ok){await r.arrayBuffer();success=true;break;}await r.arrayBuffer();if(![429,500,502,503,504].includes(r.status))throw Error(`Media ${key}: HTTP ${r.status}`);await new Promise(r=>setTimeout(r,1000*(attempt+1)));
 }
 if(!success)throw Error('Media retry limit: '+key);
 let verified=false;for(let attempt=0;attempt<5;attempt++){
  const check=await fetch(url.replace('/object/','/object/public/')+'?verify='+hash.slice(0,16),{method:'HEAD',signal:AbortSignal.timeout(30000)});
  if(check.ok&&Number(check.headers.get('content-length'))===size){verified=true;break;}
  await new Promise(r=>setTimeout(r,1000*(attempt+1)));
 }
 if(!verified)throw Error('Media size verification failed: '+key);
 report.files[key]={bytes:size,sha256:hash};report.complete=false;writeFileSync(reportPath,JSON.stringify(report,null,2));
 if(++done%25===0)console.log(`Media verified: ${done}/${files.length}`);
}}
await Promise.all(Array.from({length:3},worker));report.complete=true;report.finished_at=new Date().toISOString();writeFileSync(reportPath,JSON.stringify(report,null,2));console.log(`Media completed: ${done} files.`);
