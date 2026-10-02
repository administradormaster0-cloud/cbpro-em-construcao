import {all,get,where,save,patch,transaction,log} from './db.mjs';
import {ensureCredits} from './credits.mjs';
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
const tables={player:'player_profiles',team:'teams',org:'federations',easy_league:'easy_leagues'};
const fields={player:{handle:'handle',platform_handle:'platform_handle',position:'position',photo:'photo_object_key',photo_object_key:'photo_object_key',country_id:'country_id',slug:'slug'},team:{name:'name',tag:'tag',slug:'slug',emblem:'emblem_object_key',emblem_object_key:'emblem_object_key',formation:'formation',lineup_assignments:'lineup_assignments'},org:{name:'name',short_name:'short_name',slug:'slug',logo:'logo_object_key',logo_object_key:'logo_object_key',description:'description'},easy_league:{name:'name',logo:'logo_object_key'}};
function entity(user,type,id){if(!user)fail('Faça login.',401);const table=tables[type],row=table&&get(table,id);if(!row)fail('Registro não encontrado.',404);const owns=[row.user_id,row.owner_user_id,row.created_by_user_id].includes(user.id)||type==='org'&&where('user_federations','user_id',user.id).some(r=>r.federation_id===id&&['OWNER','ADMIN'].includes(r.role));if(user.role!=='admin'&&!owns)fail('Sem permissão.',403);return {table,row};}
export function fieldQuote(user,p){
 const {row}=entity(user,p.p_entity_type,p.p_entity_id),rule=all('field_edit_costs').find(r=>r.entity_type===p.p_entity_type&&r.field_key===p.p_field_key&&r.active);
 if(!rule)return {configured:false,is_free:true,cost:0,cost_after_free:0,free_edits_remaining:0};
 const season=rule.renews_per_season?all('ranking_seasons').find(s=>s.is_active&&(!row.game_id||s.game_id===row.game_id)):null;
 let used=where('local_field_edits','entity_id',row.id).filter(r=>r.entity_type===p.p_entity_type&&r.field_key===p.p_field_key);
 if(rule.renews_per_season)used=used.filter(r=>(r.season_id||null)===(season?.id||null));
 if(rule.free_edit_mode==='x_per_period'&&rule.free_edit_period_days>0)used=used.filter(r=>Date.parse(r.created_at)>=Date.now()-rule.free_edit_period_days*86400000);
 const total=['first_free','x_per_period'].includes(rule.free_edit_mode)?Number(rule.free_edit_count||0):0,remaining=Math.max(0,total-used.length),free=rule.free_edit_mode==='always_free'||remaining>0||!rule.credit_cost;
 return {configured:true,is_free:free,cost:free?0:Number(rule.credit_cost),cost_after_free:Number(rule.credit_cost||0),free_edits_used:used.length,free_edits_total:total,free_edits_remaining:remaining,renews_per_season:!!rule.renews_per_season,season_id:season?.id||null,season_name:season?.name||null,field_label:rule.field_label||p.p_field_key};
}
export function applyFieldEdits(user,p){return transaction(()=>{
 const {table,row}=entity(user,p.p_entity_type,p.p_entity_id);
 if(!Array.isArray(p.p_changes)||p.p_changes.length>30)fail('Lista de alterações inválida.');
 const operation=p.p_operation_id?String(p.p_operation_id):null,payload=JSON.stringify({type:p.p_entity_type,id:p.p_entity_id,changes:p.p_changes});
 if(operation){const prior=where('local_edit_operations','user_id',user.id).find(r=>r.operation_id===operation);if(prior){if(prior.payload!==payload)fail('Operação já utilizada para outras alterações.',409);return prior.result;}}
 const seen=new Set(),changes={},events=[];let cost=0;
 for(const change of p.p_changes){const field=fields[p.p_entity_type]?.[change.field_key];if(!field)fail('Campo não permitido: '+change.field_key);if(seen.has(field))fail('Campo repetido.');seen.add(field);
  const value=change.new_value;if(JSON.stringify(value)===JSON.stringify(row[field]))continue;
  if(field!=='lineup_assignments'&&value!==null&&typeof value!=='string'&&typeof value!=='number')fail('Valor inválido.');
  if(typeof value==='string'&&value.length>4000)fail('Texto excede o limite.');
  if(field==='slug'&&(!/^[a-z0-9][a-z0-9-]{1,79}$/.test(value)||all(table).some(r=>r.id!==row.id&&r.slug===value)))fail('URL inválida ou já utilizada.',409);
  const quote=fieldQuote(user,{...p,p_field_key:change.field_key});cost+=quote.cost;changes[field]=value;events.push({user_id:user.id,entity_type:p.p_entity_type,entity_id:row.id,field_key:change.field_key,old_value:row[field]??null,new_value:value,cost:quote.cost,season_id:quote.season_id||null,operation_id:operation,created_at:new Date().toISOString()});
 }
 const wallet=ensureCredits(user);if(wallet.balance<cost)fail('INSUFFICIENT_CREDITS',409);
 if(events.length){patch(table,row.id,changes);events.forEach(e=>save('local_field_edits',e));if(cost){patch('user_ai_credits',wallet.id,{balance:wallet.balance-cost,lifetime_used:(wallet.lifetime_used||0)+cost});save('credit_transactions',{user_id:user.id,amount:-cost,balance_after:wallet.balance-cost,type:'field_edit',description:'Edição de '+p.p_entity_type,operation_id:operation,created_at:new Date().toISOString()});}log(user,'field_edit',table,row.id);}
 const result={success:true,total_cost:cost,new_balance:wallet.balance-cost};if(operation)save('local_edit_operations',{user_id:user.id,operation_id:operation,payload,result});return result;
});}
