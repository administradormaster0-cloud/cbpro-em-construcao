import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
process.env.FC_DATA_DIR=mkdtempSync(join(tmpdir(),'fcclubs-original-test-'));
const {save,where,db}=await import('../server/db.mjs');
const {generateExistingStage}=await import('../server/competition.mjs');
const {adaptOriginalFrontend}=await import('../server/frontend-compat.mjs');
const {rest}=await import('../server/rest.mjs');
const user={id:'admin',role:'admin'};
function fixture(type,best=1){const t=save('tournaments',{name:'Original UI'}),stage=save('tournament_stages',{tournament_id:t.id,stage_type:type,best_of_default:best});for(let i=0;i<4;i++){const entrant=save('entrants',{tournament_id:t.id,seed:i+1});save('registrations',{entrant_id:entrant.id,status:'APPROVED'});}return stage;}
test('alternative local stage API generates groups plus scheduled matches and blocks duplicate generation',()=>{const stage=fixture('GROUPS');generateExistingStage(user,stage.id,{num_groups:2});assert.equal(where('stage_groups','stage_id',stage.id).length,2);assert.equal(where('match_series','stage_id',stage.id).length,2);assert.throws(()=>generateExistingStage(user,stage.id,{num_groups:2}),/já foi gerada/);});
test('alternative local playoff generation respects best-of-three',()=>{const stage=fixture('PLAYOFFS',3);generateExistingStage(user,stage.id);const matches=where('match_series','stage_id',stage.id);assert.equal(matches.length,3);for(const m of matches){assert.equal(m.best_of,3);assert.equal(where('series_games','series_id',m.id).length,3);}});
test('original bundle algorithms remain byte-for-byte identical before endpoint localization',()=>{const source=readFileSync(new URL('../../site/js/index-CL0UsMlE.rw7div.js',import.meta.url),'utf8');assert.equal(adaptOriginalFrontend(source),source);});
test.after(()=>db.close());
test('original REST score editor advances a best-of-three winner',()=>{const stage=fixture('PLAYOFFS',3);generateExistingStage(user,stage.id);const semi=where('match_series','stage_id',stage.id).find(m=>m.round_number===1),games=where('series_games','series_id',semi.id).sort((a,b)=>a.game_number-b.game_number);for(const game of games.slice(0,2))rest('series_games','PATCH',new URLSearchParams({id:'eq.'+game.id}),{status:'PLAYED',score_a:2,score_b:0,winner_entrant_id:semi.entrant_a_id},user,{});const final=where('match_series','stage_id',stage.id).find(m=>m.round_number===2);assert.equal(final["entrant_"+semi.next_slot+"_id"],semi.entrant_a_id);assert.equal(where('match_series','stage_id',stage.id).find(m=>m.id===semi.id).status,'FINISHED');});
