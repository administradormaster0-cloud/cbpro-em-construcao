import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
process.env.FC_DATA_DIR=mkdtempSync(join(tmpdir(),'fc-original-parity-'));
const {save,where,db}=await import('../server/db.mjs');
const {rest}=await import('../server/rest.mjs');
const {seedOrder}=await import('../server/competition.mjs');
const source=readFileSync(new URL('../../site/js/index-CL0UsMlE.rw7div.js',import.meta.url),'utf8');
const component=source.slice(source.indexOf('function AdminBrackets(){'),source.indexOf('function AdminStandings(){'));
const groups=component.slice(component.indexOf('nr=async()=>')+3,component.indexOf(',jr=async()=>'));
const playoffs=component.slice(component.indexOf('jr=async()=>')+3,component.indexOf(';return jsxRuntimeExports.jsxs'));
const user={id:'admin',role:'admin'};
test('classification order matches the actual original function for every supported bracket size',()=>{
 const start=source.indexOf('function generateClassificationSeeding('),end=source.indexOf('function applyClassificationSeeding(',start);
 assert.ok(start>=0&&end>start);
 const original=Function(source.slice(start,end)+'; return generateClassificationSeeding;')();
 for(const size of [2,4,8,16,32,64,128,256])assert.deepEqual(seedOrder(size),original(size));
 assert.deepEqual(seedOrder(8),[1,8,4,5,3,6,2,7]);
 assert.deepEqual(seedOrder(16),[1,16,4,13,6,11,8,9,7,10,5,12,3,14,2,15]);
});
function client(){return {from(table){return {insert(body){let single=false;const request={select(){return request;},single(){single=true;return request;},then(resolve,reject){try{const result=rest(table,'POST',new URLSearchParams(),body,user,{});return Promise.resolve({data:single?result.data[0]:result.data,error:null}).then(resolve,reject);}catch(error){return Promise.resolve({data:null,error}).then(resolve,reject);}}};return request;}};}};}
async function run(code,type,count,best=1){
 const tournament=save('tournaments',{name:'Original algorithm fixture'}),stage=save('tournament_stages',{tournament_id:tournament.id,stage_type:type,best_of_default:best});
 const entrants=Array.from({length:count},(_,i)=>save('entrants',{tournament_id:tournament.id,seed:i+1}));
 const errors=[];
 const fn=Function('Ct','rr','Lt','Gt','Ht','supabase','ue$1','return ('+code+')')(stage.id,stage,entrants,2,()=>{},client(),{success(){},error(message){errors.push(message);}});
 await fn();assert.deepEqual(errors,[]);return {stage,entrants};
}
test('actual captured original playoff handler uses consecutive seeds, slots and only initial round matches',async()=>{
 const {stage,entrants}=await run(playoffs,'PLAYOFFS',5,3),bracket=where('brackets','stage_id',stage.id)[0],rounds=where('bracket_rounds','bracket_id',bracket.id).sort((a,b)=>a.round_number-b.round_number);
 assert.deepEqual(rounds.map(r=>r.name),['Round 1','Semifinal','Final']);
 const slots=where('bracket_slots','round_id',rounds[0].id).sort((a,b)=>a.slot_number-b.slot_number);
 assert.equal(slots.length,8);assert.deepEqual(slots.slice(0,5).map(s=>s.entrant_id),entrants.map(e=>e.id));assert.ok(slots.slice(5).every(s=>s.entrant_id===null));
 const matches=where('match_series','stage_id',stage.id);assert.equal(matches.length,2);
 assert.ok(matches.some(m=>m.entrant_a_id===entrants[0].id&&m.entrant_b_id===entrants[1].id));
 assert.ok(matches.some(m=>m.entrant_a_id===entrants[2].id&&m.entrant_b_id===entrants[3].id));
 for(const match of matches)assert.equal(where('series_games','series_id',match.id).length,3);
});
test('actual captured original group handler creates randomized groups and standings without scheduling matches',async()=>{
 const {stage,entrants}=await run(groups,'GROUPS',6),created=where('stage_groups','stage_id',stage.id);
 assert.deepEqual(created.map(g=>g.name).sort(),['Grupo A','Grupo B']);
 const assignments=created.flatMap(g=>where('group_entrants','stage_group_id',g.id));assert.equal(assignments.length,6);assert.equal(new Set(assignments.map(r=>r.entrant_id)).size,6);
 assert.ok(entrants.every(e=>assignments.some(r=>r.entrant_id===e.id)));assert.ok(created.every(g=>where('group_entrants','stage_group_id',g.id).length===3));
 assert.equal(where('stage_standings','stage_id',stage.id).length,6);assert.equal(where('match_series','stage_id',stage.id).length,0);
});
test.after(()=>db.close());
