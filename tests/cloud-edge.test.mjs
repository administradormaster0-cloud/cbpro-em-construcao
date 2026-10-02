import test from 'node:test';
import assert from 'node:assert/strict';
import {runCloud,get,save,patch,transaction,where,all,remove} from '../cloud/db.mjs';
import {matches,filters,valueAt} from '../cloud/query.mjs';
function database(records){let revision=1,commits=0;return {get commits(){return commits;},async request(name,p){assert.equal(p.p_revision,revision);if(name==='fc_runtime_commit'){commits++;revision++;for(const c of p.p_changes){const k=c.collection+':'+c.id;if(c.action==='delete')records.delete(k);else records.set(k,c.doc);}return {revision};}
 const docs=[...records].filter(([k])=>k.startsWith(p.p_collection+':')).map(([,r])=>r).filter(r=>matches(r,p.p_filter||{op:'and',children:[]}));return {rows:structuredClone(docs),count:docs.length,offset:0};}};}
test('cloud replay commits once, preserves IDs and sees its own writes',async()=>{
 const records=new Map([['teams:t',{id:'t',name:'Before'}],['games:g',{id:'g',name:'FC'}]]),remote=database(records);const generated=[];
 const {result}=await runCloud(()=>{const row=save('notes',{text:'test'});generated.push(row.id);patch('teams','t',{name:'After'});assert.equal(get('teams','t').name,'After');assert.equal(get('games','g').name,'FC');return row;},{request:remote.request,revision:1});
 assert.equal(new Set(generated).size,1);assert.equal(remote.commits,1);assert.equal(records.get('teams:t').name,'After');assert.ok(records.has('notes:'+result.id));
});
test('rejected cloud operation never commits partial changes',async()=>{
 const remote=database(new Map());await assert.rejects(runCloud(()=>transaction(()=>{save('teams',{name:'Discard'});throw Error('Denied');}),{request:remote.request,revision:1}),/Denied/);assert.equal(remote.commits,0);
});
test('parallel requests do not share identities or pending writes',async()=>{
 const ids=await Promise.all(['alice','bob'].map(async name=>{const remote=database(new Map([['teams:t',{id:'t',name}]]));return (await runCloud(()=>{const row=save('notes',{name});assert.equal(get('teams','t').name,name);return row;},{request:remote.request,revision:1})).result;}));assert.notEqual(ids[0].id,ids[1].id);assert.deepEqual(ids.map(x=>x.name),['alice','bob']);
});
test('cloud filters retain nested logic, null semantics and literal strings',()=>{
 const f=filters(new URLSearchParams({or:'(name.ilike.*united*,and(score.gte.3,active.eq.true))'}));assert.ok(matches({name:'Ghost United'},f));assert.ok(matches({score:4,active:true},f));assert.ok(!matches({score:2,active:true},f));assert.ok(!matches({name:null},{key:'name',op:'eq',value:'x',negate:true}));assert.equal(valueAt({a:{b:2}},'a.b'),2);
});

test('cloud ID and owner reads request only matching records and preserve pending changes',async()=>{
 const records=new Map(Array.from({length:2000},(_,n)=>['teams:'+n,{id:String(n),owner_user_id:n===1?'alice':'bob'}]));
 const remote=database(records),reads=[];
 const request=async(name,p)=>{if(name==='fc_edge_select')reads.push(p);return remote.request(name,p);};
 const {result}=await runCloud(()=>{
  assert.equal(get('teams','1').owner_user_id,'alice');
  assert.equal(where('teams','owner_user_id','alice').length,1);
  patch('teams','1',{owner_user_id:'bob'});
  save('teams',{id:'new',owner_user_id:'alice'});
  assert.deepEqual(where('teams','owner_user_id','alice').map(r=>r.id),['new']);
  remove('teams','new');
  return where('teams','owner_user_id','alice');
 },{request,revision:1});
 assert.deepEqual(result,[]);
 assert.equal(reads.length,2);
 assert.deepEqual(reads.map(p=>p.p_filter.key),['id','owner_user_id']);
 assert.equal(remote.commits,1);
});

test('full hydrated collection is reused for later ID and owner lookups',async()=>{
 const remote=database(new Map([['teams:a',{id:'a',owner_user_id:'alice'}],['teams:b',{id:'b',owner_user_id:'bob'}]]));
 let reads=0;
 const request=async(name,p)=>{if(name==='fc_edge_select')reads++;return remote.request(name,p);};
 await runCloud(()=>{assert.equal(all('teams').length,2);assert.equal(get('teams','a').owner_user_id,'alice');assert.equal(where('teams','owner_user_id','bob')[0].id,'b');},{request,revision:1});
 assert.equal(reads,1);
});
