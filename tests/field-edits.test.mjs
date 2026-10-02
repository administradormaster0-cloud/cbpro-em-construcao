import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
process.env.FC_DATA_DIR=mkdtempSync(join(tmpdir(),'fc-edits-'));
const {save,get,where,db}=await import('../server/db.mjs');
const {applyFieldEdits,fieldQuote}=await import('../server/field-edits.mjs');
const user={id:'owner',role:'member'},base={p_entity_type:'player',p_entity_id:'profile'};
test('field edits consume free allowance then debit configured cost, with retry protection',()=>{
 save('player_profiles',{id:'profile',user_id:'owner',handle:'Old'});save('field_edit_costs',{entity_type:'player',field_key:'handle',active:true,credit_cost:3,free_edit_mode:'first_free',free_edit_count:1});
 assert.equal(fieldQuote(user,{...base,p_field_key:'handle'}).is_free,true);
 const first={...base,p_operation_id:'one',p_changes:[{field_key:'handle',new_value:'First'}]};assert.equal(applyFieldEdits(user,first).total_cost,0);assert.equal(applyFieldEdits(user,first).total_cost,0);
 assert.equal(where('local_field_edits','entity_id','profile').length,1);assert.equal(fieldQuote(user,{...base,p_field_key:'handle'}).cost,3);
 assert.equal(applyFieldEdits(user,{...base,p_operation_id:'two',p_changes:[{field_key:'handle',new_value:'Second'}]}).new_balance,7);
 assert.throws(()=>applyFieldEdits(user,{...first,p_changes:[{field_key:'handle',new_value:'Different'}]}),/outras alterações/);
});
test('insufficient credits roll back all fields and allowances',()=>{
 save('field_edit_costs',{entity_type:'player',field_key:'platform_handle',active:true,credit_cost:100,free_edit_mode:'always_paid'});
 assert.throws(()=>applyFieldEdits(user,{...base,p_changes:[{field_key:'handle',new_value:'Rollback'},{field_key:'platform_handle',new_value:'Expensive'}]}),/INSUFFICIENT/);
 assert.equal(get('player_profiles','profile').handle,'Second');assert.equal(where('user_ai_credits','user_id','owner')[0].balance,7);assert.equal(where('local_field_edits','entity_id','profile').length,2);
});
test('edits reject foreign ownership, duplicate aliases and arbitrary columns',()=>{
 assert.throws(()=>applyFieldEdits({id:'stranger',role:'member'},{...base,p_changes:[]}),/permissão/);
 assert.throws(()=>applyFieldEdits(user,{...base,p_changes:[{field_key:'user_id',new_value:'stranger'}]}),/Campo não permitido/);
 assert.throws(()=>applyFieldEdits(user,{...base,p_changes:[{field_key:'photo',new_value:'one'},{field_key:'photo_object_key',new_value:'two'}]}),/repetido/);
});
test.after(()=>db.close());
