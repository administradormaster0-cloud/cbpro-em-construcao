// Archive only the explicitly identified fixture created by this workspace's
// manual playoff check. Imported teams/profiles and their accounts are retained.
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {db,get,all,remove,transaction,dataDir} from '../server/db.mjs';
import {resolve} from 'node:path';
const id='a1861f83-d800-4e41-ae58-737d86b00599',tournament=get('tournaments',id);
if(!tournament){console.log('Validation fixture already archived.');process.exit(0);}
if(tournament.name!=='QA · Validação local')throw Error('Fixture identity changed; refusing to archive.');
const tables=['tournaments','tournament_stages','entrants','registrations','stage_groups','group_entrants','stage_standings','brackets','bracket_rounds','bracket_slots','match_series','series_games','champion_roster_snapshots'];
const candidates=tables.flatMap(table=>all(table).map(row=>({table,row}))),ids=new Set([id]),selected=new Map();let changed=true;
while(changed){changed=false;for(const item of candidates){const key=item.table+':'+item.row.id;if(selected.has(key))continue;if(item.table==='tournaments'?item.row.id===id:Object.entries(item.row).some(([k,v])=>k.endsWith('_id')&&ids.has(v))){selected.set(key,item);ids.add(item.row.id);changed=true;}}}
const records=[...selected.values()];writeFileSync(resolve(dataDir,'archived-validation-fixture.json'),JSON.stringify({archived_at:new Date().toISOString(),records},null,2));
process.loadEnvFile(fileURLToPath(new URL('../.env.supabase.local',import.meta.url)));
const quote=s=>"'"+String(s).replaceAll("'","''")+"'";
const sql='BEGIN;\n'+records.map(({table,row})=>`DELETE FROM public."${table}" WHERE id=${quote(row.id)};`).join('\n')+'\nCOMMIT;';
const response=await fetch(`https://api.supabase.com/v1/projects/${process.env.SUPABASE_PROJECT_REF}/database/query`,{method:'POST',headers:{Authorization:`Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({query:sql})});
if(!response.ok)throw Error(`Cloud fixture cleanup HTTP ${response.status}; local backup retained.`);
transaction(()=>records.forEach(({table,row})=>remove(table,row.id)));db.close();console.log(`Archived ${records.length} fixture records; original teams and profiles retained.`);
