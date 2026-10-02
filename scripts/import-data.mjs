import { readdirSync, statSync, readFileSync, createReadStream, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { db, save, dataDir } from '../server/db.mjs';

const source=fileURLToPath(new URL('../../extracted_data/',import.meta.url));
const files=readdirSync(source).filter(n=>n.endsWith('.json')&&!n.endsWith('.provenance.json'));
const tables=[...new Set(files.map(n=>n.replace(/(?:_FULL)?\.json$/,'')))];
const report={ imported_at:new Date().toISOString(),source,tables:[],missing:['transfer_logs','users_profile','brackets','bracket_rounds','registrations'],notes:['Contas e senhas do site original não constam das exportações. Contas locais são independentes.','Dados históricos só são importados dos arquivos fornecidos.'] };
for(const table of tables){
 const name=files.includes(table+'_FULL.json')?table+'_FULL.json':table+'.json';
 if(db.prepare('SELECT value FROM meta WHERE key=?').get('import:'+table)){ const c=db.prepare('SELECT count(*) n FROM records WHERE collection=?').get(table).n; report.tables.push({table,file:name,count:c}); continue; }
 let count=0;
 db.exec('BEGIN');
 try {
  if(statSync(resolve(source,name)).size<20e6){
   const rows=JSON.parse(readFileSync(resolve(source,name),'utf8'));
   if(Array.isArray(rows)) for(const row of rows) {save(table,row);count++;}
  }else{
   // Export files contain a pretty-printed top-level JSON array. Consume one
   // object at a time, keeping even the 448 MB match export bounded in memory.
   const lines=createInterface({input:createReadStream(resolve(source,name)),crlfDelay:Infinity});
   let buffer='',depth=0,quoted=false,escape=false;
   for await(const line of lines){
    for(const ch of line+'\n'){
     if(!buffer && ch!=='{') continue;
     buffer+=ch;
     if(quoted){if(escape)escape=false;else if(ch==='\\')escape=true;else if(ch==='"')quoted=false;}
     else if(ch==='"')quoted=true;else if(ch==='{')depth++;else if(ch==='}')depth--;
     if(depth===0&&!quoted){save(table,JSON.parse(buffer));buffer='';count++;}
    }
   }
   if(buffer.trim())throw new Error('JSON incompleto: '+name);
  }
  db.prepare('INSERT INTO meta(key,value) VALUES(?,?)').run('import:'+table,JSON.stringify({file:name,count}));
  db.exec('COMMIT');
 }catch(e){db.exec('ROLLBACK');throw e;}
 report.tables.push({table,file:name,count}); console.log(table+': '+count);
}
for(const key of ['user_id','team_id','player_profile_id','tournament_id','stage_id','series_id','federation_id','entrant_id','country_id'])db.exec(`CREATE INDEX IF NOT EXISTS idx_${key} ON records(collection,json_extract(doc,'$.${key}'))`);
report.total=report.tables.reduce((n,t)=>n+t.count,0);
writeFileSync(resolve(dataDir,'import-report.json'),JSON.stringify(report,null,2));
console.log('Imported '+report.total+' records across '+report.tables.length+' collections.');
db.close();
