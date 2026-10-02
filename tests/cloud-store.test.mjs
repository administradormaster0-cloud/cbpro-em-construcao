import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
process.env.FC_DATA_DIR=mkdtempSync(join(tmpdir(),'fc-cloud-store-'));
const {db,save,get,transaction}=await import('../server/db.mjs');
const {createCloudStore}=await import('../server/cloud-store.mjs');
const response=data=>new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}});
function setup(fetch){db.exec("DELETE FROM cloud_changes;DELETE FROM meta WHERE key='cloud_revision';");return createCloudStore({url:'https://example.test',key:'server-only',fetch});}
test('cloud commit publishes only final changes and supports nested business transactions',async()=>{
 let sent;const store=setup(async(url,options)=>{if(url.includes('fc_runtime_state'))return response([{revision:1}]);if(url.includes('fc_runtime_records'))return response([]);sent=JSON.parse(options.body);return response({revision:2});});
 await store.initialize();await store.mutate(()=>transaction(()=>{save('teams',{id:'club',name:'Before'});save('teams',{id:'club',name:'After'});}));
 assert.equal(sent.p_changes.length,1);assert.equal(sent.p_changes[0].doc.name,'After');assert.equal(store.status().revision,2);assert.equal(db.prepare('SELECT count(*) n FROM cloud_changes').get().n,0);
});
test('application failure rolls back cache and never reaches remote commit',async()=>{
 let commits=0;const store=setup(async url=>{if(url.includes('fc_runtime_state'))return response([{revision:1}]);if(url.includes('fc_runtime_records'))return response([]);commits++;return response({revision:2});});
 await store.initialize();await assert.rejects(store.mutate(()=>{save('teams',{id:'bad'});throw Error('Failed rule');}),/Failed rule/);
 assert.equal(get('teams','bad'),null);assert.equal(commits,0);assert.equal(store.status().available,true);
});
test('revision conflict rolls back local writes and disables further mutations until recovery',async()=>{
 const store=setup(async url=>{if(url.includes('fc_runtime_state'))return response([{revision:1}]);if(url.includes('fc_runtime_records'))return response([]);return new Response(JSON.stringify({message:'FC_REVISION_CONFLICT',code:'40001'}),{status:409});});
 await store.initialize();await assert.rejects(store.mutate(()=>save('teams',{id:'conflict'})),/FC_REVISION_CONFLICT/);assert.equal(get('teams','conflict'),null);assert.equal(store.status().available,false);
});
test('ambiguous network retry reuses operation ID and applies exactly once',async()=>{
 const ids=[];const store=setup(async(url,options)=>{if(url.includes('fc_runtime_state'))return response([{revision:1}]);if(url.includes('fc_runtime_records'))return response([]);ids.push(JSON.parse(options.body).p_operation);if(ids.length===1)throw Error('connection lost after commit');return response({revision:2,replayed:true});});
 await store.initialize();await store.mutate(()=>save('teams',{id:'retry'}));assert.equal(ids.length,2);assert.equal(ids[0],ids[1]);assert.equal(store.status().revision,2);
});

test('cloud-only reads refresh a changed remote revision and reject offline reads',async()=>{
 let revision=1,offline=false;
 const store=createCloudStore({url:'https://example.test',key:'server-only',cloudOnly:true,fetch:async url=>{
  if(offline)throw Error('cloud unavailable');
  if(url.includes('fc_runtime_state'))return response([{revision}]);
  if(url.includes('fc_runtime_records'))return response([{collection:'teams',id:'remote',doc:{id:'remote',name:'Revision '+revision}}]);
  throw Error('Unexpected commit');
 }});
 db.exec("DELETE FROM cloud_changes;DELETE FROM meta WHERE key='cloud_revision';");
 await store.initialize();assert.equal(get('teams','remote').name,'Revision 1');
 revision=2;
 assert.equal(await store.mutate(()=>get('teams','remote').name),'Revision 2');
 offline=true;await assert.rejects(store.mutate(()=>get('teams','remote')),/cloud unavailable/);
 assert.equal(store.status().local_database_reads,false);
});
test.after(()=>db.close());
