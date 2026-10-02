import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
process.loadEnvFile(fileURLToPath(new URL('../.env.supabase.local',import.meta.url)));
const source=readFileSync(fileURLToPath(new URL('../../reverse_engineering/original-admin/snapshots/current-public.js',import.meta.url)),'utf8');
const buckets=[...new Set([...source.matchAll(/\.storage\.from\(["']([^"']+)["']\)/g)].map(m=>m[1]).concat(readdirSync(fileURLToPath(new URL('../data/uploads/',import.meta.url)),{withFileTypes:true}).filter(f=>f.isDirectory()).map(f=>f.name)))].sort();
const base=process.env.SUPABASE_URL,headers={apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json'};
let response=await fetch(`${base}/storage/v1/bucket`,{headers});if(!response.ok)throw Error(`Bucket listing HTTP ${response.status}`);
const existing=new Set((await response.json()).map(b=>b.id));
for(const id of buckets){if(existing.has(id))continue;
 response=await fetch(`${base}/storage/v1/bucket`,{method:'POST',headers,body:JSON.stringify({id,name:id,public:true,file_size_limit:20*1024*1024,allowed_mime_types:['image/png','image/jpeg','image/webp','image/gif','image/avif','image/svg+xml']})});
 if(!response.ok)throw Error(`Bucket ${id}: HTTP ${response.status}`);
}
writeFileSync(fileURLToPath(new URL('../data/supabase-storage-report.json',import.meta.url)),JSON.stringify({at:new Date().toISOString(),buckets,uploaded:0,notes:'Public image buckets; no browser write policies. Local media has not been uploaded.'},null,2));
console.log(`${buckets.length} image buckets configured. Media upload pending.`);
