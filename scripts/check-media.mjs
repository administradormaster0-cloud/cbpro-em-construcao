import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const manifest=JSON.parse(readFileSync(fileURLToPath(new URL('../data/media-manifest.json',import.meta.url)),'utf8'));
const report={checked_at:new Date().toISOString(),checked:0,valid:0,failures:[]};let cursor=0;
async function worker(){while(cursor<manifest.length){const {key}=manifest[cursor++];try{
 const response=await fetch('http://localhost:3000/backend/storage/v1/object/public/'+key.split('/').map(encodeURIComponent).join('/'),{method:'HEAD',signal:AbortSignal.timeout(15000)});
 const type=response.headers.get('content-type');if(!response.ok||!type?.startsWith('image/'))report.failures.push({key,status:response.status,type});else report.valid++;
 }catch(error){report.failures.push({key,error:error.message});}report.checked++;}}
await Promise.all(Array.from({length:4},worker));writeFileSync(fileURLToPath(new URL('../data/media-verification.json',import.meta.url)),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
