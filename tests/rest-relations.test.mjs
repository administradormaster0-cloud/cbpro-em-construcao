import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
process.env.FC_DATA_DIR=mkdtempSync(join(tmpdir(),'fc-relations-'));
const {save,db}=await import('../server/db.mjs');
const {rest}=await import('../server/rest.mjs');
const read=(table,query,user=null)=>rest(table,'GET',new URLSearchParams(query),{},user,{});
test('inner relations filter before pagination and exact count',()=>{
 save('games',{id:'fc',name:'FC'});save('games',{id:'other',name:'Other'});
 for(let i=0;i<6;i++)save('teams',{id:'t'+i,name:'Team '+i,game_id:i%2?'other':'fc'});
 const result=read('teams',{select:'id,games!inner(name)','games.name':'eq.FC',order:'id.asc',offset:'1',limit:'1'});
 assert.equal(result.count,3);assert.deepEqual(result.data,[{id:'t2',games:{name:'FC'}}]);
});
test('left embedded filters preserve parents and filter only nested rows',()=>{
 const result=read('teams',{select:'id,games(name)','games.name':'eq.FC',order:'id.asc',limit:'2'});
 assert.equal(result.count,6);assert.equal(result.data[1].games,null);
});
test('private rows cannot be accessed through a public relationship or count',()=>{
 save('users_profile',{id:'secret',email:'private@example.test'});save('roles',{id:'adminrole',key:'ADMIN'});save('user_roles',{user_id:'secret',role_id:'adminrole'});save('player_profiles',{id:'player',user_id:'secret'});
 assert.equal(read('player_profiles',{select:'id,users_profile(*)'}).data[0].users_profile,null);
 assert.equal(read('roles',{select:'id,user_roles(count)'}).data[0].user_roles[0].count,0);
 assert.equal(read('player_profiles',{select:'id,users_profile(*)'},{id:'secret',role:'member'}).data[0].users_profile.email,'private@example.test');
});
test('nested inner joins remove unmatched reverse relationships',()=>{
 save('tournaments',{id:'tour'});save('entrants',{id:'entry',tournament_id:'tour',team_id:'t1'});
 assert.equal(read('tournaments',{select:'id,entrants!inner(teams!inner(name))','entrants.teams.name':'eq.Team 0'}).count,0);
 assert.equal(read('tournaments',{select:'id,entrants!inner(teams!inner(name))','entrants.teams.name':'eq.Team 1'}).count,1);
});
test('marketplace cosmetics and bundle items retain their collection metadata',()=>{
 save('cosmetic_collections',{id:'phoenix',name:'Phoenix Rising'});
 save('cosmetics',{id:'flame',collection_id:'phoenix',name:'Flame'});
 save('cosmetic_bundles',{id:'set',collection_id:'phoenix'});
 save('cosmetic_bundle_items',{id:'item',bundle_id:'set',cosmetic_id:'flame'});
 assert.deepEqual(read('cosmetics',{select:'id,cosmetic_collections(name)'}).data[0].cosmetic_collections,{name:'Phoenix Rising'});
 const result=read('cosmetic_bundles',{select:'id,cosmetic_bundle_items(cosmetics(name,cosmetic_collections(name)))'});
 assert.equal(result.data[0].cosmetic_bundle_items[0].cosmetics.cosmetic_collections.name,'Phoenix Rising');
});
test('original Champions query resolves champion_entrant_id to entrant and winning team',()=>{
 save('teams',{id:'winner-team',name:'Botafogo ES'});
 save('entrants',{id:'winner-entry',team_id:'winner-team'});
 save('trophies',{id:'gold',name:'Gold'});
 save('tournaments',{id:'finished-cup',name:'Cup',status:'FINISHED',champion_entrant_id:'winner-entry',trophy_id:'gold'});
 const result=read('tournaments',{status:'eq.FINISHED',champion_entrant_id:'not.is.null',select:'id,champion_entrant:champion_entrant_id(id,team_id,teams(id,name)),trophies:trophy_id(id,name)'});
 assert.equal(result.data[0].champion_entrant.teams.name,'Botafogo ES');
 assert.equal(result.data[0].trophies.name,'Gold');
});
test.after(()=>db.close());
