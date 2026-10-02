import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
process.env.FC_DATA_DIR=mkdtempSync(join(tmpdir(),'fc-transfer-'));
const {save,get,where,db}=await import('../server/db.mjs');
const {validateTransfer}=await import('../server/transfers.mjs');
const {transferPlayer}=await import('../server/competition.mjs');
const {rpc}=await import('../server/rpc.mjs');
const member={id:'member',role:'member'};
function setup(prefix,window='OPEN',rules={}){save('player_profiles',{id:prefix,user_id:member.id,game_id:'fc'});save('teams',{id:prefix+'-team',game_id:'fc'});save('tournaments',{id:prefix+'-t',name:prefix,status:'RUNNING',federation_id:prefix+'-f',transfer_window_status:window});save('entrants',{team_id:prefix+'-team',tournament_id:prefix+'-t'});save('transfer_settings',{federation_id:prefix+'-f',...rules});return {player_profile_id:prefix,to_team_id:prefix+'-team'};}
test('closed windows reject actual writes and preserve roster/history',()=>{const p=setup('closed','FULL_LOCK');assert.equal(validateTransfer(p,member).allowed,false);assert.throws(()=>transferPlayer(member,p.player_profile_id,p.to_team_id),/fechada/);assert.equal(where('team_players','player_profile_id','closed').length,0);assert.equal(where('transfer_logs','player_profile_id','closed').length,0);});
test('free-agent exception, roster cap and cooldown are enforced',()=>{const p=setup('free','FULL_LOCK',{allow_free_agent_during_full:true,max_roster_size:1,cooldown_hours_after_transfer:24});assert.equal(validateTransfer(p,member).allowed,true);save('team_players',{id:'occupied',team_id:p.to_team_id,player_profile_id:'someone'});assert.match(validateTransfer(p,member).reason,/limite/);db.prepare('DELETE FROM records WHERE collection=? AND id=?').run('team_players','occupied');save('transfer_logs',{player_profile_id:'free',created_at:new Date().toISOString()});assert.match(validateTransfer(p,member).reason,/intervalo/);});
test('original invite field accepts atomically and returns success',()=>{const p=setup('invite');save('team_invites',{id:'inv',invited_profile_id:'invite',team_id:p.to_team_id,status:'PENDING'});assert.throws(()=>rpc('fn_accept_team_invite',{p_invite_id:'inv'},{id:'stranger',role:'member'}),/outro jogador/);assert.equal(get('team_invites','inv').status,'PENDING');const result=rpc('fn_accept_team_invite',{p_invite_id:'inv',p_expected_team_id:p.to_team_id},member);assert.equal(result.success,true);assert.equal(get('team_invites','inv').status,'ACCEPTED');assert.equal(where('team_players','player_profile_id','invite')[0].team_id,p.to_team_id);assert.throws(()=>rpc('fn_accept_team_invite',{p_invite_id:'inv'},member),/respondido/);});
test('active bans block transfers while expired bans do not',()=>{const p=setup('banned');save('bans',{id:'ban',player_profile_id:'banned',active:true,is_global:true,ends_at:'2099-01-01'});assert.match(validateTransfer(p,member).reason,/banimento/);save('bans',{id:'ban',player_profile_id:'banned',active:true,is_global:true,ends_at:'2000-01-01'});assert.equal(validateTransfer(p,member).allowed,true);});
test.after(()=>db.close());
