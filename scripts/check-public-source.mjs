import {mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const base='https://fcclubs.pro/',dir='../reverse_engineering/public-source-check';mkdirSync(dir,{recursive:true});
const report={checked_at:new Date().toISOString(),page:base,assets:[],maps:[],repository_links:[],edge_functions:[],rpc_functions:[]};
const page=await fetch(base);const html=await page.text();writeFileSync(dir+'/index.html',html);
const assets=[...new Set([...html.matchAll(/(?:src|href)=["']([^"']+\.js(?:\?[^"']*)?)["']/g)].map(m=>new URL(m[1],base).href))].filter(u=>new URL(u).origin===new URL(base).origin);
for(const url of assets){const r=await fetch(url);const source=await r.text();if(!r.ok)continue;report.assets.push({url,bytes:Buffer.byteLength(source),sha256:createHash('sha256').update(source).digest('hex')});writeFileSync(dir+'/'+new URL(url).pathname.split('/').pop(),source);
for(const m of source.matchAll(/https?:\/\/(?:github\.com|gitlab\.com|bitbucket\.org)\/[^\s"'`<>\\)]+/g))report.repository_links.push(m[0]);
for(const m of source.matchAll(/\.invoke\(["']([^"']+)["']/g))report.edge_functions.push(m[1]);
for(const m of source.matchAll(/\.rpc\(["']([^"']+)["']/g))report.rpc_functions.push(m[1]);
const refs=[r.headers.get('SourceMap'),r.headers.get('X-SourceMap'),...[...source.matchAll(/[#@]\s*sourceMappingURL=([^\s]+)/g)].map(m=>m[1]),url+'.map'].filter(Boolean);
for(const ref of new Set(refs)){if(ref.startsWith('data:'))continue;const mapUrl=new URL(ref,url).href;if(new URL(mapUrl).origin!==new URL(base).origin)continue;const mr=await fetch(mapUrl);const text=await mr.text();let map;try{map=JSON.parse(text);}catch{}const valid=!!map&&map.version===3&&Array.isArray(map.sources);report.maps.push({url:mapUrl,status:mr.status,content_type:mr.headers.get('content-type'),valid_source_map:valid});if(valid)writeFileSync(dir+'/'+new URL(mapUrl).pathname.split('/').pop(),text);}
}
for(const k of ['repository_links','edge_functions','rpc_functions'])report[k]=[...new Set(report[k])].sort();
writeFileSync(dir+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
