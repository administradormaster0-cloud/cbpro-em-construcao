import test from 'node:test';
import assert from 'node:assert/strict';
import {paginateRpc} from '../server/rpc-response.mjs';
test('original paginated ranking loop terminates without duplicated RPC rows',()=>{
 const rows=Array.from({length:2000},(_,id)=>({id})),loaded=[];let requests=0;
 for(let offset=0;offset<4000;offset+=1000){const page=paginateRpc(rows,new URLSearchParams({offset:String(offset),limit:'1000'}));requests++;loaded.push(...page.data);if(page.data.length<1000)break;}
 assert.equal(requests,3);assert.equal(loaded.length,2000);assert.equal(new Set(loaded.map(r=>r.id)).size,2000);
});
test('RPC ranges return correct headers and leave scalar responses intact',()=>{
 const result=paginateRpc([1,2,3,4],new URLSearchParams(),'1-2');assert.deepEqual(result.data,[2,3]);assert.equal(result.headers['Content-Range'],'1-2/4');
 const object={success:true};assert.equal(paginateRpc(object,new URLSearchParams()).data,object);
 assert.throws(()=>paginateRpc([],new URLSearchParams({offset:'-1'})),/inválido/);
});
