import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
process.env.FC_DATA_DIR=mkdtempSync(join(tmpdir(),'fc-imports-'));
const {save,where,all,db}=await import('../server/db.mjs');
const {importRows}=await import('../server/imports.mjs');
const admin={id:'admin',role:'admin'};
let owner;
test('cloud auth rejects creation of unusable local accounts',()=>{
 const previous=process.env.FC_CLOUD_AUTH;process.env.FC_CLOUD_AUTH='true';
 try{assert.throws(()=>importRows('import-users',{users:[{email:'cloud@test.local',password:'test-password-123'}]},admin),/Supabase Auth/);assert.equal(all('users_profile').length,0);}
 finally{if(previous===undefined)delete process.env.FC_CLOUD_AUTH;else process.env.FC_CLOUD_AUTH=previous;}
});
test('bulk accounts isolate invalid rows and never expose submitted passwords',()=>{
 assert.throws(()=>importRows('import-users',{users:[]},{id:'member',role:'member'}),/administrativo/);
 const result=importRows('import-users',{users:[{email:'owner@test.local',password:'local-password-123'},{email:'bad',password:'x'}]},admin);
 assert.equal(result.summary.created,1);assert.equal(result.summary.errors,1);assert.ok(!JSON.stringify(result).includes('local-password-123'));owner=result.results[0].id;
 assert.equal(importRows('import-users',{users:[{email:'owner@test.local',password:'new-password-123'}]},admin).summary.skipped,1);
});
test('teams and player roster import validate references, avoid duplicates and roll back bad rows',()=>{
 save('games',{id:'fc'});save('countries',{id:'br'});save('platforms',{id:'ps'});
 const input={teams:[{email:'owner@test.local',name:'Test team',country_id:'br',game_id:'fc'}]};assert.equal(importRows('import-teams',input,admin).summary.created,1);assert.equal(importRows('import-teams',input,admin).summary.skipped,1);
 const profiles={user_id:owner,game_id:'fc',platform_id:'ps',rows:[{handle:'Player',team:'Test team',position:'ST'},{handle:'Rollback',team:'Missing'}]};
 const result=importRows('import-player-profiles',profiles,admin);assert.equal(result.summary.created,1);assert.equal(result.summary.errors,1);assert.equal(all('player_profiles').length,1);assert.equal(all('team_players').length,1);
 assert.equal(importRows('import-player-profiles',profiles,admin).summary.skipped,1);
});
test('imported career stats add counts and use match-weighted average rating',()=>{
 const input={rows:[{handle:'Player',total_matches:2,total_goals:3,avg_rating:8}]};assert.equal(importRows('import-player-stats',input,admin).mapped,1);
 importRows('import-player-stats',{rows:[{handle:'Player',total_matches:6,total_goals:1,avg_rating:6}]},admin);
 const stats=all('player_imported_stats')[0];assert.equal(stats.total_matches,8);assert.equal(stats.total_goals,4);assert.equal(stats.avg_rating,6.5);
 const invalid=importRows('import-player-stats',{rows:[{handle:'Player',total_matches:-1}]},admin);assert.equal(invalid.errors,1);assert.equal(all('player_imported_stats')[0].total_matches,8);
});
test('match import skips duplicate external IDs and rejects invalid scores',()=>{
 const result=importRows('import-eafc-matches',{rows:[{match_id:'123',home_goals:2,away_goals:1},{match_id:123},{match_id:124,home_goals:-1}]},admin);
 assert.equal(result.inserted,1);assert.equal(result.skipped,1);assert.equal(result.errors,1);assert.equal(where('eafc_newgen_matches','match_id',123).length,1);
});
test.after(()=>db.close());
