import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import ts from 'typescript';
process.env.FC_DATA_DIR=mkdtempSync(join(tmpdir(),'fc-workflow-'));
const {save,get,where,db}=await import('../server/db.mjs');
const {rest}=await import('../server/rest.mjs');
const admin={id:'admin',role:'admin'};
const original=name=>readFileSync(new URL('./fixtures/original-admin/'+name+'.js',import.meta.url),'utf8');
function client(){return {from(table){let method='GET',body={},single=false;const q=new URLSearchParams();const request={select(value='*'){q.set('select',value);return request;},insert(value){method='POST';body=value;return request;},update(value){method='PATCH';body=value;return request;},delete(){method='DELETE';return request;},eq(key,value){q.set(key,'eq.'+value);return request;},in(key,value){q.set(key,'in.('+value.join(',')+')');return request;},order(key,{ascending=true}={}){q.set('order',key+(ascending?'.asc':'.desc'));return request;},limit(n){q.set('limit',String(n));return request;},maybeSingle(){single=true;return request;},single(){single=true;return request;},then(resolve,reject){try{const result=rest(table,method,q,body,admin,{});return Promise.resolve({data:single?result.data[0]||null:result.data,error:null}).then(resolve,reject);}catch(error){return Promise.resolve({data:null,error}).then(resolve,reject);}}};return request;}};}
const supabase=client();
function extractedHandler(component,name){const source=original(component),ast=ts.createSourceFile(component+'.js',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);let code;function visit(node){if(ts.isVariableDeclaration(node)&&node.name.getText(ast)===name)code=node.initializer.getText(ast);ts.forEachChild(node,visit);}visit(ast);assert.ok(code,'Handler '+name+' exists in original '+component);return code;}
const recompute=Function('supabase',original('standingsComparator')+original('sortStandings')+original('recomputeStageStandings')+';return recomputeStageStandings;')(supabase);
test('original standings algorithm counts two-leg games separately and best-of-three as one series',async()=>{
 const stage=save('tournament_stages',{stage_type:'GROUPS',standings_mode:'WDL_POINTS'}),group=save('stage_groups',{stage_id:stage.id});
 for(const id of ['a','b','c'])save('group_entrants',{stage_group_id:group.id,entrant_id:id});
 const legs=save('match_series',{stage_id:stage.id,group_id:group.id,entrant_a_id:'a',entrant_b_id:'b',best_of:2});
 for(const [a,b,w]of [[2,0,'a'],[1,1,null]])save('series_games',{series_id:legs.id,status:'PLAYED',score_a:a,score_b:b,winner_entrant_id:w});
 const best=save('match_series',{stage_id:stage.id,group_id:group.id,entrant_a_id:'a',entrant_b_id:'c',best_of:3});
 save('series_games',{series_id:best.id,status:'PLAYED',score_a:1,score_b:0,winner_entrant_id:'a'});
 await recompute(stage.id);let a=where('stage_standings','stage_id',stage.id).find(r=>r.entrant_id==='a');assert.equal(a.played,2);assert.equal(a.points,4);
 save('series_games',{series_id:best.id,status:'PLAYED',score_a:3,score_b:0,winner_entrant_id:'a'});
 await recompute(stage.id);a=where('stage_standings','stage_id',stage.id).find(r=>r.entrant_id==='a');assert.equal(a.played,3);assert.equal(a.points,7);assert.equal(a.score_for,7);assert.equal(where('stage_standings','stage_id',stage.id).length,3);
});
test('original score update is not overwritten by the alternative local generator',()=>{
 const stage=save('tournament_stages',{stage_type:'PLAYOFFS'}),series=save('match_series',{stage_id:stage.id,entrant_a_id:'one',entrant_b_id:'two',best_of:2,status:'SCHEDULED'}),game=save('series_games',{series_id:series.id,status:'SCHEDULED'});
 rest('series_games','PATCH',new URLSearchParams({id:'eq.'+game.id}),{status:'PLAYED',score_a:0,score_b:0,winner_entrant_id:null},admin,{});
 assert.equal(get('match_series',series.id).status,'SCHEDULED');
});
test('full original structure generator persists classification seeding, byes and configured rounds',async()=>{
 const tournament=save('tournaments',{name:'Full original generator',rules_overrides_json:{}}),entrants=Array.from({length:6},(_,i)=>save('entrants',{tournament_id:tournament.id,seed:i+1}));
 const apply=Function(original('generateClassificationSeeding')+original('applyClassificationSeeding')+';return applyClassificationSeeding;')();
 const rounds=[{name:'Quartas',bestOf:3},{name:'Semifinal',bestOf:5},{name:'Final',bestOf:1}];
 const generate=Function('supabase','Qo','Sn','ax','Uo','tx','Ct','applyClassificationSeeding','return ('+extractedHandler('StepStructure','Hx')+')')(supabase,8,'classification',{},'byes',rounds,tournament,apply);
 await generate(entrants,1);
 const stage=where('tournament_stages','tournament_id',tournament.id)[0],bracket=where('brackets','stage_id',stage.id)[0],created=where('bracket_rounds','bracket_id',bracket.id).sort((a,b)=>a.round_number-b.round_number);
 assert.deepEqual(stage.rules_json.round_configs,rounds.map(r=>({name:r.name,best_of:r.bestOf})));
 const slots=where('bracket_slots','round_id',created[0].id).sort((a,b)=>a.slot_number-b.slot_number);
 assert.deepEqual(slots.map(s=>s.entrant_id),[entrants[0].id,null,entrants[3].id,entrants[4].id,entrants[2].id,entrants[5].id,entrants[1].id,null]);
 const matches=where('match_series','stage_id',stage.id);assert.equal(matches.length,2);for(const m of matches){assert.equal(m.best_of,3);assert.equal(where('series_games','series_id',m.id).length,3);}
});
test('actual original next-round handler preserves slot order, bye advancement and per-round best-of',async()=>{
 const source=original('StepMatches'),ast=ts.createSourceFile('StepMatches.js',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);let handler;
 function walk(node){if(ts.isVariableDeclaration(node)&&node.name.getText(ast)==='py')handler=node.initializer.getText(ast);ts.forEachChild(node,walk);}walk(ast);assert.ok(handler);
 const stage=save('tournament_stages',{stage_type:'PLAYOFFS',best_of_default:1,rules_json:{round_configs:[{best_of:1},{best_of:3}]}}),bracket=save('brackets',{stage_id:stage.id});
 const first=save('bracket_rounds',{bracket_id:bracket.id,round_number:1}),next=save('bracket_rounds',{bracket_id:bracket.id,round_number:2,name:'Semifinal'});
 ['a',null,'b','c','d','e','f','g'].forEach((id,i)=>save('bracket_slots',{round_id:first.id,slot_number:i+1,entrant_id:id}));
 const series=[['b','c','c'],['d','e','d'],['f','g','g']].map(([a,b,w])=>save('match_series',{stage_id:stage.id,bracket_round_id:first.id,entrant_a_id:a,entrant_b_id:b,winner_entrant_id:w,status:'FINISHED'}));
 const errors=[],fn=Function('supabase','Qo','ue$1','st','G1','return ('+handler+')')(supabase,()=>{},{success(){},error(m){errors.push(m);}},()=>{},async()=>{});
 await fn(stage,series);assert.deepEqual(errors,[]);
 const slots=where('bracket_slots','round_id',next.id).sort((a,b)=>a.slot_number-b.slot_number);assert.deepEqual(slots.map(r=>r.entrant_id),['a','c','d','g']);
 const matches=where('match_series','bracket_round_id',next.id);assert.equal(matches.length,2);for(const match of matches){assert.equal(match.best_of,3);assert.equal(where('series_games','series_id',match.id).length,3);}
 await fn(stage,series);assert.match(errors[0],/já foi gerada/);assert.equal(where('match_series','bracket_round_id',next.id).length,2);
});
test.after(()=>db.close());
