import {clock,stableRandom,isHydration} from './db.mjs';
import {all,where,get,save,patch,transaction,log} from './db.mjs';
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
const tiers={free:0,pro:1,ultra:2};
export function subscriptionStatus(user){
 if(!user)return {plan:'free',subscribed:false,subscription_end:null,game_subscriptions:{}};
 const ids=new Set([user.id,...where('player_profiles','user_id',user.id).map(p=>p.id)]);
 const rows=all('subscriptions').filter(s=>s.entity_type==='player'&&ids.has(s.entity_id)&&s.status==='active'&&(!s.current_period_end||Date.parse(s.current_period_end)>clock()));
 const result={plan:'free',subscribed:false,subscription_end:null,game_subscriptions:{}};
 for(const row of rows){const plan=get('plans',row.plan_id),tier=plan?.tier||'free';if((tiers[tier]||0)>(tiers[result.plan]||0)){result.plan=tier;result.subscription_end=row.current_period_end||null;}if(row.game_id){const old=result.game_subscriptions[row.game_id];if(!old||(tiers[tier]||0)>(tiers[old.plan]||0))result.game_subscriptions[row.game_id]={plan:tier,subscribed:tier!=='free',subscription_end:row.current_period_end||null};}}
 result.subscribed=result.plan!=='free';return result;
}
// Called inside the caller's transaction; bonus creation is idempotent.
export function ensureCredits(user){
 if(!user)fail('Faça login.',401);
 const old=where('user_ai_credits','user_id',user.id)[0];if(old)return old;
 const plan=subscriptionStatus(user).plan,config=where('plan_credit_config','plan_key',plan)[0],bonus=Math.max(0,Number(config?.monthly_credits??10));
 const row=save('user_ai_credits',{user_id:user.id,balance:bonus,lifetime_used:0,monthly_bonus:bonus,last_bonus_at:new Date(clock()).toISOString()});
 save('credit_transactions',{user_id:user.id,amount:bonus,balance_after:bonus,type:'monthly_bonus',description:'Bônus inicial local do plano '+plan,created_at:new Date(clock()).toISOString()});return row;
}
export function spendCredits(user,p){return transaction(()=>{
 if(/^(ai_tournament_|avatar_|banner_ai$|bg_remove$|card_ai_|emblem_ai_)/.test(String(p?.featureKey||''))&&!Deno.env.get('OPENAI_API_KEY')&&!Deno.env.get('AI_API_KEY')&&!Deno.env.get('FC_AI_API_KEY'))fail('Provedor de IA não configurado no backend. Nenhum crédito foi consumido e nada foi gerado.',503);
 if(!user)fail('Faça login.',401);
 const feature=where('ai_feature_costs','feature_key',p.featureKey).find(f=>f.active);if(!feature)fail('Recurso de créditos não encontrado.',404);
 const amount=Number(feature.credit_cost);if(!Number.isFinite(amount)||amount<0)fail('Custo inválido.');
 const operation=p.operation_id?String(p.operation_id):null;
 if(operation){const old=where('credit_transactions','user_id',user.id).find(r=>r.operation_id===operation);if(old){if(old.feature_key!==p.featureKey)fail('Operação já utilizada para outro recurso.',409);return {success:true,newBalance:old.balance_after};}}
 const wallet=ensureCredits(user);if(wallet.balance<amount)fail('INSUFFICIENT_CREDITS',409);
 const balance=wallet.balance-amount;patch('user_ai_credits',wallet.id,{balance,lifetime_used:(wallet.lifetime_used||0)+amount});
 save('credit_transactions',{user_id:user.id,amount:-amount,balance_after:balance,type:'spend',feature_key:p.featureKey,operation_id:operation,description:feature.feature_label||p.featureKey,created_at:new Date(clock()).toISOString()});log(user,'spend_credits','user_ai_credits',wallet.id);return {success:true,newBalance:balance};
});}
