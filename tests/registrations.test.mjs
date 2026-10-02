import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
process.env.FC_DATA_DIR=mkdtempSync(join(tmpdir(),'fc-registration-'));
const {save,get,where,db}=await import('../server/db.mjs');
const {rest}=await import('../server/rest.mjs');
const user={id:'owner',role:'member'},post=(table,row)=>rest(table,'POST',new URLSearchParams(),row,user,{}).data[0];
test('original two-request registration works for a team owner without approving itself',()=>{
 save('games',{id:'fc',participant_type:'TEAM'});save('tournaments',{id:'cup',game_id:'fc',status:'REG_OPEN',created_by_user_id:'organizer'});save('teams',{id:'team',game_id:'fc',owner_user_id:'owner'});
 const entrant=post('entrants',{tournament_id:'cup',team_id:'team'});
 assert.throws(()=>post('registrations',{tournament_id:'cup',entrant_id:entrant.id,status:'APPROVED'}),/permissão|aprovação/);
 const registration=post('registrations',{tournament_id:'cup',entrant_id:entrant.id});assert.equal(registration.status,'PENDING');
 assert.throws(()=>post('entrants',{tournament_id:'cup',team_id:'team'}),/já inscrito/);
 assert.throws(()=>post('registrations',{tournament_id:'cup',entrant_id:entrant.id}),/já existente/);
 assert.throws(()=>rest('registrations','PATCH',new URLSearchParams({id:'eq.'+registration.id}),{status:'APPROVED'},user,{}),/organização/);assert.equal(get('registrations',registration.id).status,'PENDING');
});
test('registrations reject other owners, incompatible games and closed windows',()=>{
 save('teams',{id:'foreign',game_id:'fc',owner_user_id:'other'});assert.throws(()=>post('entrants',{tournament_id:'cup',team_id:'foreign'}),/permissão/);
 save('teams',{id:'wrong-game',game_id:'racing',owner_user_id:'owner'});assert.throws(()=>post('entrants',{tournament_id:'cup',team_id:'wrong-game'}),/mesmo jogo/);
 save('tournaments',{id:'closed',game_id:'fc',status:'RUNNING'});assert.throws(()=>post('entrants',{tournament_id:'closed',team_id:'team'}),/permissão/);
 assert.equal(where('entrants','tournament_id','closed').length,0);
});
test.after(()=>db.close());
