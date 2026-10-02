import test from 'node:test';import assert from 'node:assert/strict';
import {runCloud} from '../supabase/functions/fc-api/db.mjs';import {matches} from '../supabase/functions/fc-api/query.mjs';import {rest} from '../supabase/functions/fc-api/rest.mjs';
test('staged cloud invitation create/read/cancel preserves permissions through hydration and commit',async()=>{
 const records=new Map([['user_federations:membership',{id:'membership',user_id:'owner',federation_id:'org',role:'OWNER'}],['org_staff_invites:foreign',{id:'foreign',federation_id:'other',email:'foreign@example.invalid',status:'PENDING'}]]);let revision=1,commits=0;
 const request=async(name,p)=>{assert.equal(p.p_revision,revision);if(name==='fc_runtime_commit'){commits++;revision++;for(const change of p.p_changes){const key=change.collection+':'+change.id;if(change.action==='delete')records.delete(key);else records.set(key,change.doc);}return {revision};}const rows=[...records].filter(([key])=>key.startsWith(p.p_collection+':')).map(([,row])=>row).filter(row=>matches(row,p.p_filter||{op:'and',children:[]}));return {rows:structuredClone(rows),count:rows.length,offset:0};};
 const owner={id:'owner',email:'owner@example.invalid',role:'member'},stranger={id:'stranger',email:'stranger@example.invalid',role:'member'};
 const call=async(method,body,user,filter={})=>(await runCloud(()=>rest('org_staff_invites',method,new URLSearchParams(filter),body,user,{}),{request,revision})).result;
 const row=(await call('POST',{federation_id:'org',invited_by:'owner',email:'invitee@example.invalid',role:'STAFF'},owner)).data[0];assert.equal(row.status,'PENDING');assert.equal(commits,1);
 assert.deepEqual((await call('GET',{},owner)).data.map(x=>x.id),[row.id]);assert.equal((await call('GET',{},stranger)).data.length,0);
 await assert.rejects(call('POST',{federation_id:'org',invited_by:'stranger',email:'test@example.invalid',role:'STAFF'},stranger),/permissão/);assert.equal(commits,1);
 await call('PATCH',{status:'CANCELLED'},owner,{id:'eq.'+row.id});assert.equal(records.get('org_staff_invites:'+row.id).status,'CANCELLED');assert.equal(records.get('org_staff_invites:foreign').status,'PENDING');assert.equal(commits,2);
});
