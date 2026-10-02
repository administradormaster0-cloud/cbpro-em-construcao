import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
process.env.FC_DATA_DIR=mkdtempSync(join(tmpdir(),'fc-cloud-auth-'));
const {createCloudAuth}=await import('../server/cloud-auth.mjs');
const {db,get,where}=await import('../server/db.mjs');
test('cloud identity is validated remotely and editable metadata cannot grant admin',async()=>{
 let calls=0;const auth=createCloudAuth({url:'https://example.supabase.co',key:'test',fetch:async(url,options)=>{calls++;assert.equal(options.headers.Authorization||options.headers.get?.('Authorization'),'Bearer a.b.c');return new Response(JSON.stringify({id:'member-id',email:'member@example.test',user_metadata:{role:'admin',display_name:'Member'},created_at:new Date().toISOString()}),{status:200,headers:{'Content-Type':'application/json'}});}});
 const user=await auth.authenticate('a.b.c');assert.equal(user.role,'member');assert.equal(get('users_profile',user.id).display_name,'Member');
 await auth.authenticate('a.b.c');assert.equal(where('user_ai_credits','user_id',user.id).length,1);assert.equal(calls,2);
 assert.equal(await auth.authenticate('opaque-local-token'),null);
});
test('invalid cloud tokens do not create local profiles',async()=>{
 const auth=createCloudAuth({url:'https://example.supabase.co',key:'test',fetch:async()=>new Response(JSON.stringify({msg:'Invalid JWT'}),{status:401,headers:{'Content-Type':'application/json'}})});
 assert.equal(await auth.authenticate('bad.jwt.token'),null);
});
test.after(()=>db.close());
