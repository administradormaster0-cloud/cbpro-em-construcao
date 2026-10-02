import { readFileSync,writeFileSync,readdirSync } from 'node:fs';
import { db,all,get,save,where,transaction,dataDir } from '../server/db.mjs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const source=fileURLToPath(new URL('../../extracted_data/',import.meta.url));
let extra=0,roundCount=0;
transaction(()=>{
 for(const filename of readdirSync(source).filter(n=>n.endsWith('_FULL.json'))){const table=filename.replace('_FULL.json',''),partial=JSON.parse(readFileSync(resolve(source,table+'.json'),'utf8'));for(const row of partial){if(row.id&&!get(table,row.id)){save(table,row);extra++;}}}
 // Some exports omit bracket metadata but preserve its foreign keys on actual
 // matches. Restore only those references, retaining all original match IDs.
 for(const stage of all('tournament_stages').filter(s=>s.stage_type==='PLAYOFFS')){
  const matches=where('match_series','stage_id',stage.id),ids=[...new Set(matches.map(m=>m.bracket_round_id).filter(Boolean))];if(!ids.length)continue;
  let bracket=where('brackets','stage_id',stage.id)[0];if(!bracket)bracket=save('brackets',{stage_id:stage.id,bracket_type:'SINGLE_ELIM',metadata_source:'reconstructed_from_exported_series'});
  const groups=ids.map(id=>({id,rows:matches.filter(m=>m.bracket_round_id===id)})).sort((a,b)=>b.rows.length-a.rows.length||String(a.rows[0]?.scheduled_at).localeCompare(String(b.rows[0]?.scheduled_at)));
  groups.forEach((group,i)=>{if(!get('bracket_rounds',group.id)){const n=groups.length-i;save('bracket_rounds',{id:group.id,bracket_id:bracket.id,round_number:i+1,name:stage.rules_json?.round_configs?.[i]?.name||(n===1?'Final':n===2?'Semifinal':n===3?'Quartas de final':'Rodada '+(i+1)),metadata_source:'reconstructed_from_exported_series'});roundCount++;}});
 }
});
const report=JSON.parse(readFileSync(resolve(dataDir,'import-report.json'),'utf8'));report.partial_only_records_added=extra;report.reconstructed_bracket_rounds=roundCount;report.missing=['users_profile','registrations'];report.transfer_public_read={count:0,note:'Public REST read returned 0 visible records on 2026-09-28.'};report.actual_collections=db.prepare('SELECT collection name,count(*) count FROM records GROUP BY collection').all();report.actual_total=report.actual_collections.reduce((n,r)=>n+r.count,0);writeFileSync(resolve(dataDir,'import-report.json'),JSON.stringify(report,null,2));console.log({extra,roundCount,total:report.actual_total});
