import { readdirSync,existsSync,mkdirSync,writeFileSync,readFileSync,statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve,basename,dirname,sep } from 'node:path';
import { all,dataDir } from '../server/db.mjs';
const site=fileURLToPath(new URL('../../site/assets/img/',import.meta.url));
const bundled=new Set(readdirSync(site).flatMap(n=>[n,n.replace(/\.[a-z0-9]+(?=\.[^.]+$)/,'')]));
const specs=[['player_profiles','photo_object_key','player-photos'],['teams','emblem_object_key','team-emblems'],['games','logo_object_key','game-logos'],['federations','logo_object_key','federation-logos'],['tournaments','logo_object_key','tournament-logos'],['tournaments','cover_object_key','tournament-covers'],['hero_mascot_settings','image_object_key','hero-mascot']];
const queue=[],seen=new Set();
for(const [table,field,bucket]of specs)for(const row of all(table)){let key=row[field];if(!key||typeof key!=='string')continue;if(key.startsWith('http')){const url=new URL(key);if(url.hostname!=='pkoysigjsorpefekkiqf.supabase.co')continue;key=url.pathname.split('/object/public/')[1];}else key=bucket+'/'+key;const file=resolve(dataDir,'uploads',key);if(!file.startsWith(resolve(dataDir,'uploads')+sep)||seen.has(key)||existsSync(file)||bundled.has(basename(key)))continue;seen.add(key);queue.push({key,file});}
let index=0,bytes=0,downloaded=0;const failures=[];
async function worker(){while(index<queue.length){const job=queue[index++];try{const res=await fetch('https://pkoysigjsorpefekkiqf.supabase.co/storage/v1/object/public/'+job.key.split('/').map(encodeURIComponent).join('/'),{signal:AbortSignal.timeout(30000)});if(!res.ok)throw new Error('HTTP '+res.status);if(!res.headers.get('content-type')?.startsWith('image/'))throw new Error('Not an image');const body=Buffer.from(await res.arrayBuffer());if(body.length>20e6)throw new Error('Image exceeds 20 MB');mkdirSync(dirname(job.file),{recursive:true});writeFileSync(job.file,body);bytes+=body.length;downloaded++;if(downloaded%25===0)console.log(`Cached ${downloaded}/${queue.length} (${Math.round(bytes/1e6)} MB)`);}catch(e){failures.push({key:job.key,error:e.message});}}}
await Promise.all(Array.from({length:6},worker));
const report={at:new Date().toISOString(),requested:queue.length,downloaded,bytes,failures};writeFileSync(resolve(dataDir,'media-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({requested:queue.length,downloaded,mb:Math.round(bytes/1e6),failures:failures.length}));
