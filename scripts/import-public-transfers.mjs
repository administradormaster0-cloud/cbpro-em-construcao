import { readFileSync,writeFileSync } from 'node:fs';
const bundle=readFileSync(new URL('../../site/js/index-CL0UsMlE.rw7div.js',import.meta.url),'utf8');
const base=bundle.match(/https:\/\/[a-z0-9]+\.supabase\.co/)?.[0];
const key=bundle.match(/sb_publishable_[A-Za-z0-9_-]+/)?.[0];
if(!base||!key)throw new Error('Configuração pública não encontrada.');
const rows=[];let offset=0;
while(true){
 const res=await fetch(`${base}/rest/v1/transfer_logs?select=*&order=created_at.asc,id.asc&offset=${offset}&limit=1000`,{headers:{apikey:key,Prefer:'count=exact'},signal:AbortSignal.timeout(30000)});
 if(!res.ok)throw new Error(`Leitura pública recusada: HTTP ${res.status}. Nenhuma tentativa com privilégio adicional.`);
 const page=await res.json();if(!Array.isArray(page))throw new Error('Resposta inesperada');rows.push(...page);offset+=page.length;
 console.log(`Transferências públicas: ${offset}; total informado: ${res.headers.get('content-range')}`);
 if(page.length<1000)break;
}
writeFileSync(new URL('../../extracted_data/transfer_logs.json',import.meta.url),JSON.stringify(rows,null,2));
writeFileSync(new URL('../../extracted_data/transfer_logs.provenance.json',import.meta.url),JSON.stringify({source:'https://fcclubs.pro/',resource:'transfer_logs',access:'anonymous publishable key, public read only',fetched_at:new Date().toISOString(),count:rows.length},null,2));
