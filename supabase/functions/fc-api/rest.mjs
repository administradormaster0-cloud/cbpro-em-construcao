import {avatarOfferVisible,scopeAvatarOffers,canWriteAvatar,avatarWriteDefaults,validateAvatarWrite} from './avatar-access.mjs';
import {managesOrganization,staffInviteVisible,scopeStaffInvites,validateStaffInvite} from './organization-access.mjs';
import {clock,stableRandom,isHydration} from './db.mjs';
import { transferDefaults,validateTransfer } from './transfers.mjs';
import { db,field,get,save,where,all,remove,transaction,log } from './db.mjs';
import { syncOriginalSeries } from './competition.mjs';
import { participantCanWrite,validateRegistrationInsert } from './registrations.mjs';
export function split(input){let depth=0,quote=false,start=0,out=[];for(let i=0;i<input.length;i++){const c=input[i];if(c==='"')quote=!quote;if(!quote){if(c==='(')depth++;if(c===')')depth--;if(c===','&&depth===0){out.push(input.slice(start,i).trim());start=i+1;}}}out.push(input.slice(start).trim());return out.filter(Boolean);}
export {selectRows} from './db.mjs';
import {selectRows,embeddedMatches} from './db.mjs';
const singular={countries:'country',player_profiles:'player_profile',users_profile:'user',match_series:'series',series_games:'game',tournament_stages:'stage',stage_groups:'group',bracket_rounds:'bracket_round',easy_custom_teams:'easy_custom_team',cosmetic_collections:'collection',cosmetic_bundles:'bundle',avatar_nfts:'nft'};
const base=t=>singular[t]||t.replace(/ies$/,'y').replace(/s$/,'');
const fkTables={country_id:'countries',state_id:'states',game_id:'games',platform_id:'platforms',team_id:'teams',player_profile_id:'player_profiles',user_id:'users_profile',tier_id:'tiers',federation_id:'federations',tournament_id:'tournaments',stage_id:'tournament_stages',group_id:'stage_groups',entrant_id:'entrants',champion_entrant_id:'entrants',home_entrant_id:'entrants',away_entrant_id:'entrants',winner_entrant_id:'entrants',trophy_id:'trophies',series_id:'match_series',bracket_id:'brackets',role_id:'roles'};
function relation(parent,row,header){
 let [alias,reference]=header.includes(':')?header.split(':'):[header.split('!')[0],header];let [target,hint]=reference.split('!');if(hint==='inner'||hint==='left')hint=null;
 let fk;
 if(target.endsWith('_id')){fk=target;target=fkTables[target]||target.replace(/_id$/,'s');}
 if(!fk&&hint){const keys=Object.keys(row).filter(k=>k.endsWith('_id'));fk=keys.sort((a,b)=>b.length-a.length).find(k=>hint.includes(k));}
 if(!fk&&row[base(target)+'_id']!==undefined)fk=base(target)+'_id';
 if(!fk&&row[alias+'_id']!==undefined)fk=alias+'_id';
 if(!fk&&target==='friendly_listings'&&row.listing_id!==undefined)fk='listing_id';
 if(fk)return {alias,target,one:true,rows:row[fk]?[get(target,row[fk])].filter(Boolean):[]};
 const back=parent==='stage_groups'&&target==='group_entrants'?'stage_group_id':base(parent)+'_id';return {alias,target,one:false,rows:where(target,back,row.id)};
}
function readable(table,row,user){if(!privateTables.has(table)||user?.role==='admin')return true;if(!user)return false;if(table==='users_profile')return row.id===user.profile_id||row.id===user.id||row.legacy_user_id===user.id||row.auth_user_id===user.auth_user_id;if(table==='avatar_offers')return avatarOfferVisible(row,user);if(table==='org_staff_invites')return staffInviteVisible(row,user);return row.user_id===user.id||row.user_id===user.profile_id;}
export function project(table,row,selection='*',depth=0,context={}){
 const {user=null,query=new URLSearchParams(),path=''}=context;
 if(!readable(table,row,user))return null;
 if(depth>6)return null;const out={};
 for(const token of split(selection)){
  if(token==='*'){Object.assign(out,row);continue;}
  const open=token.indexOf('(');if(open>0){
   const header=token.slice(0,open),sub=token.slice(open+1,-1),rel=relation(table,row,header),childPath=path?path+'.'+rel.alias:rel.alias;
   const candidates=rel.rows.filter(r=>readable(rel.target,r,user)&&embeddedMatches(r,query,childPath));
   const mapped=candidates.map(r=>project(rel.target,r,sub==='count'?'*':sub,depth+1,{user,query,path:childPath})).filter(r=>r!==null);
   if(header.split('!').includes('inner')&&!mapped.length)return null;
   if(sub==='count'){out[rel.alias]=[{count:mapped.length}];continue;}
   out[rel.alias]=rel.one?(mapped[0]||null):mapped;
  }else{const [alias,key]=token.includes(':')?token.split(':'):[token,token];out[alias]=row[key]??null;}
 }
 return out;
}
export const privateTables=new Set(['avatar_offers','fc_audit','fc_system_reports','local_field_edits','local_edit_operations','users_profile','user_roles','user_ai_credits','credit_transactions','direct_messages','direct_conversations','admin_user_permissions','admin_section_permissions','admin_user_feature_access','org_staff_invites','organization_requests','bans','player_profile_change_logs','account_deletion_requests']);
export function canWrite(user,table,row){
 if(!user)return false;if(user.role==='admin')return true;
 const owners={users_profile:'id',player_profiles:'user_id',teams:'owner_user_id',tournaments:'created_by_user_id',recruitment_ads:'user_id',friendly_listings:'user_id',drafts:'created_by_user_id',fantasy_teams:'user_id',federation_followers:'user_id',match_alert_subscriptions:'user_id'};
 if(owners[table])return row[owners[table]]===user.id;
 if(['avatar_listings','avatar_offers'].includes(table))return canWriteAvatar(user,table,row);
 if(table==='org_staff_invites')return managesOrganization(user,row.federation_id);
 if(participantCanWrite(user,table,row))return true;
 const tournamentChildren={entrants:'tournament_id',registrations:'tournament_id',tournament_stages:'tournament_id',tournament_allowed_tiers:'tournament_id',stage_groups:'stage_id',stage_standings:'stage_id',match_series:'stage_id',brackets:'stage_id',bracket_rounds:'bracket_id',bracket_slots:'round_id',group_entrants:'stage_group_id',series_games:'series_id'};
 const parentTables={tournament_id:'tournaments',stage_id:'tournament_stages',bracket_id:'brackets',round_id:'bracket_rounds',stage_group_id:'stage_groups',series_id:'match_series'};
 const parent=tournamentChildren[table];if(parent&&row[parent]){const record=get(parentTables[parent],row[parent]);return record?canWrite(user,parentTables[parent],record):false;}
 if(['shooter_match_reports','shooter_leaderboard','shooter_points_config','shooter_tournaments'].includes(table)){const tournament=get('tournaments',row.tournament_id);return !!tournament&&(user.role==='admin'||tournament.created_by_user_id===user.id);}
 if(['draft_entries','draft_teams','draft_draw_assignments'].includes(table)){const d=get('drafts',row.draft_id);return d?.created_by_user_id===user.id;}
 if(table==='team_invites')return get('teams',row.team_id)?.owner_user_id===user.id;
 if(['fantasy_lineups','fantasy_lineup_players'].includes(table)){const t=table==='fantasy_lineups'?get('fantasy_teams',row.fantasy_team_id||row.team_id):get('fantasy_lineups',row.lineup_id);return t?canWrite(user,table==='fantasy_lineups'?'fantasy_teams':'fantasy_lineups',t):false;}
 return false;
}
const defaults={org_staff_invites:{status:'PENDING'},transfer_settings:transferDefaults,tournaments:{status:'DRAFT',rules_overrides_json:{}},match_series:{status:'SCHEDULED',best_of:1,winner_entrant_id:null},series_games:{status:'SCHEDULED',score_a:null,score_b:null,winner_entrant_id:null},stage_standings:{played:0,wins:0,draws:0,losses:0,score_for:0,score_against:0,score_diff:0,points:0,position:0},team_invites:{status:'PENDING'},registrations:{status:'PENDING'},drafts:{status:'OPEN'},recruitment_ads:{status:'OPEN'},teams:{formation:'4-3-3',lineup_assignments:{slots:{},bench:[]}},fantasy_teams:{budget:100,points:0},player_profiles:{position:null,photo_object_key:null}};
export function rest(table,method,query,body,user,headers){
 if(!/^[a-z][a-z0-9_]*$/.test(table))throw Object.assign(new Error('Tabela inválida'),{status:400});
 if(privateTables.has(table)&&user?.role!=='admin'){if(!user){if(method!=='GET'&&method!=='HEAD')throw Object.assign(new Error('Entre para alterar dados.'),{status:401});return {data:[],count:0,offset:0};}if(table==='avatar_offers')scopeAvatarOffers(query,user);else if(table==='org_staff_invites')scopeStaffInvites(query,user);else query.set(table==='users_profile'?'id':'user_id','eq.'+(table==='users_profile'?(user.profile_id||user.id):user.id));}
 if(method==='GET'||method==='HEAD'){
 const selection=query.get('select')||'*',inner=selection.includes('!inner');
 const result=selectRows(table,query,{limit:!inner});
 let data=result.rows.map(r=>project(table,r,selection,0,{user,query})).filter(r=>r!==null);
 if(inner){const count=data.length,offset=Math.max(0,Number(query.get('offset')||0)),max=Math.min(10000,Math.max(0,Number(query.get('limit')||1000)));return {data:data.slice(offset,offset+max),count,offset};}
 return {...result,data};
 }

 if(!user)throw Object.assign(new Error('Entre para alterar dados.'),{status:401});
 return transaction(()=>{
  let rows=[];
  if(method==='POST'){
   for(const raw of Array.isArray(body)?body:[body]){const input=avatarWriteDefaults(table,raw);if(!canWrite(user,table,input))throw Object.assign(new Error('Sem permissão.'),{status:403});let old=input.id?get(table,input.id):null;
    const conflict=query.get('on_conflict');if(!old&&conflict){const keys=split(conflict);for(const k of keys)field(k);old=all(table).find(r=>keys.every(k=>(r[k]??null)===(input[k]??null)));}
    validateAvatarWrite(table,'POST',input,old,user);
    if(table==='org_staff_invites')validateStaffInvite('POST',input,old,user);
    if(!old)validateRegistrationInsert(table,input,user);
    if(table==='team_invites'&&!old){const validation=validateTransfer({player_profile_id:input.invited_profile_id||input.player_profile_id,to_team_id:input.team_id,action_type:'INVITE'},user);if(!validation.allowed)throw Object.assign(new Error(validation.reason),{status:409});}
    if(old&&!canWrite(user,table,old))throw Object.assign(new Error('Sem permissão.'),{status:403});if(old&&headers.prefer?.includes('resolution=ignore'))continue;if(old&&!headers.prefer?.includes('resolution=merge'))throw Object.assign(new Error('Registro duplicado.'),{status:409});rows.push(save(table,{...defaults[table],created_at:new Date(clock()).toISOString(),...old,...input,...(old?{id:old.id}:{})}));}
  }else if(method==='PATCH'||method==='DELETE'){
   const current=selectRows(table,query,{limit:false}).rows;
   if(['entrants','registrations'].includes(table)&&current.some(r=>user.role!=='admin'&&get('tournaments',r.tournament_id)?.created_by_user_id!==user.id))throw Object.assign(new Error('Alterações de inscrição dependem da organização. Use o cancelamento de inscrição para desistir.'),{status:403});
   if(current.some(r=>!canWrite(user,table,r)||method==='PATCH'&&!canWrite(user,table,{...r,...body})))throw Object.assign(new Error('Sem permissão.'),{status:403});
   if(table==='org_staff_invites'&&method==='PATCH')for(const r of current)validateStaffInvite('PATCH',body,r,user);
   for(const r of current)validateAvatarWrite(table,method,body,r,user);
   rows=current.map(r=>{if(method==='DELETE'){remove(table,r.id);return r;}return save(table,{...r,...body,id:r.id});});
  }else throw Object.assign(new Error('Método não suportado'),{status:405});
  for(const row of rows)log(user,method,table,row.id);
  if(table==='series_games'&&method==='PATCH'&&Object.keys(body).some(k=>['status','score_a','score_b','winner_entrant_id'].includes(k)))for(const id of new Set(rows.map(r=>r.series_id)))syncOriginalSeries(id);
  return {data:rows.map(r=>project(table,r,query.get('select')||'*',0,{user,query})),count:rows.length,offset:0};
 });
}
