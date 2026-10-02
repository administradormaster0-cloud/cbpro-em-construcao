import {randomUUID} from 'node:crypto';
import {all,get,where,save,patch,remove,transaction,log} from './db.mjs';
import {ensureCredits} from './credits.mjs';

const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
const now=()=>new Date().toISOString();
const startedStatuses=new Set(['RUNNING','IN_PROGRESS','FINISHED','ARCHIVED','PLAYOFFS']);

export function repairEloCatalog(){
 const seasons=all('elo_federation_seasons');
 const versions=new Set(all('elo_config_versions').map(row=>row.id));
 for(const season of seasons){
  const id=season.current_config_version_id; if(!id||versions.has(id)) continue;
  save('elo_config_versions',{id,version_number:1,created_at:season.created_at||now(),k_factor:20,expectation_diff_cap:400,tier_gap:50,tie_policy:'manual',secondary_absence_percent:10,secondary_absence_max:3});
  versions.add(id);
 }
 const routed=new Set(all('elo_season_routes').map(row=>row.season_id));
 for(const season of seasons){
  if(!season.season_id||routed.has(season.season_id)) continue;
  save('elo_season_routes',{season_id:season.season_id,engine_version:'V2',created_at:now()});
  routed.add(season.season_id);
 }
}

export function canManageElo(user,federationId){
 if(!user) return false;
 if(user.role==='admin') return true;
 return where('user_federations','user_id',user.id).some(row=>row.federation_id===federationId&&['ADMIN','OWNER'].includes(row.role));
}

function requireManager(user,season){
 if(!user) fail('Faça login para continuar.',401);
 if(!canManageElo(user,season.federation_id)) fail('Acesso administrativo necessário.',403);
}

function seasonOf(id){
 const season=get('elo_federation_seasons',id);
 if(!season) fail('Federation Season não encontrada.',404);
 return season;
}

function configOf(season){
 repairEloCatalog();
 const config=get('elo_config_versions',season.current_config_version_id);
 if(!config) fail('Configuração ELO não encontrada.',404);
 return config;
}

function tiersOf(seasonId){
 return where('elo_season_tiers','federation_season_id',seasonId).filter(row=>row.active!==false&&['T1','T2','T3'].includes(row.code)).sort((a,b)=>a.rank-b.rank);
}

function rulesOf(versionId){return where('elo_tier_version_rules','config_version_id',versionId);}
function ruleFor(rules,tierId){return rules.find(row=>row.season_tier_id===tierId)||{};}
function activeTeams(seasonId){return where('elo_season_teams','federation_season_id',seasonId).filter(row=>row.status==='ACTIVE');}
function competitionStarted(season){
 return all('tournaments').some(row=>row.federation_id===season.federation_id&&row.ranking_season_id===season.season_id&&startedStatuses.has(row.status));
}
function assertEditable(season){
 if(season.status==='CLOSED') fail('A Season está CLOSED e a organização é somente leitura.',409);
 if(competitionStarted(season)) fail('competition in this federation/season has started',409);
}

function renumber(list){
 list.sort((a,b)=>a.tier_position-b.tier_position||String(a.team_id).localeCompare(String(b.team_id)));
 list.forEach((row,index)=>patch('elo_season_teams',row.id,{tier_position:index+1,updated_at:now()}));
}

function candidateTeams(season){
 const placed=new Set(activeTeams(season.id).map(row=>row.team_id));
 const ids=new Set();
 for(const tournament of all('tournaments')){
  if(tournament.federation_id!==season.federation_id) continue;
  if(tournament.ranking_season_id&&tournament.ranking_season_id!==season.season_id) continue;
  for(const entrant of where('entrants','tournament_id',tournament.id)) if(entrant.team_id) ids.add(entrant.team_id);
 }
 if(season.previous_federation_season_id){
  for(const row of where('elo_season_teams','federation_season_id',season.previous_federation_season_id)) if(row.status==='ACTIVE') ids.add(row.team_id);
 }
 return [...ids].filter(id=>!placed.has(id)).map(id=>get('teams',id)).filter(Boolean);
}

function placeExisting(season,teamId,tier,position){
 const rules=rulesOf(configOf(season).id),rule=ruleFor(rules,tier.id);
 const current=activeTeams(season.id);
 const mine=current.find(row=>row.team_id===teamId);
 const others=current.filter(row=>row.season_tier_id===tier.id&&row.team_id!==teamId);
 const limit=tier.code==='T3'&&(rule.max_teams==null)?null:Number(rule.max_teams||0);
 if(limit&&others.length+(mine&&mine.season_tier_id===tier.id?0:1)>limit) fail('O Tier '+tier.code+' atingiu o máximo de Teams.',409);
 const spot=Math.max(1,Math.min(Number(position)||others.length+1,others.length+1));
 others.sort((a,b)=>a.tier_position-b.tier_position);
 others.splice(spot-1,0,{id:mine?.id,team_id:teamId,hold:true});
 if(!mine){
  const created=save('elo_season_teams',{federation_season_id:season.id,team_id:teamId,season_tier_id:tier.id,tier_position:spot,elo_rating:Number(rule.initial_elo||0),matches_played:0,wins:0,draws:0,losses:0,status:'ACTIVE',created_at:now(),updated_at:now()});
  others.forEach(row=>{if(row.hold)row.id=created.id;});
 }else if(mine.season_tier_id!==tier.id){
  const previous=current.filter(row=>row.season_tier_id===mine.season_tier_id&&row.id!==mine.id);
  patch('elo_season_teams',mine.id,{season_tier_id:tier.id,tier_position:spot,updated_at:now()});
  renumber(previous);
 }
 others.forEach((row,index)=>{if(!row.hold)patch('elo_season_teams',row.id,{tier_position:index+1,updated_at:now()});else patch('elo_season_teams',row.id,{season_tier_id:tier.id,tier_position:index+1,updated_at:now()});});
}

function placePendingInT3(season){
 const tier=tiersOf(season.id).find(row=>row.code==='T3');
 if(!tier) fail('Tier T3 não encontrado.',404);
 const pending=candidateTeams(season);
 let placed=0;
 for(const team of pending){
  const count=activeTeams(season.id).filter(row=>row.season_tier_id===tier.id).length;
  placeExisting(season,team.id,tier,count+1);
  placed++;
 }
 return placed;
}

function tierCodeOfTournament(tournament){
 const map={ 'tier 1':'T1','tier 2':'T2','tier 3':'T3' };
 const codes=new Set();
 for(const link of where('tournament_allowed_tiers','tournament_id',tournament.id)){
  const tier=get('tiers',link.tier_id),name=String(tier?.name||'').toLowerCase();
  if(map[name]) codes.add(map[name]);
 }
 return codes.size===1?[...codes][0]:null;
}

function windowsFor(season){
 const tiers=tiersOf(season.id),rules=rulesOf(configOf(season).id);
 const pairs=[['T1','T2','T1_T2'],['T2','T3','T2_T3']];
 const stored=where('elo_v2_transition_windows','federation_season_id',season.id);
 const championships=where('elo_v2_tier_championships','federation_season_id',season.id);
 return pairs.map(([upper,lower,code])=>{
  const up=tiers.find(row=>row.code===upper),down=tiers.find(row=>row.code===lower);
  const window=stored.find(row=>row.boundary_code===code)||null;
  const upChamp=up&&championships.find(row=>row.season_tier_id===up.id);
  const downChamp=down&&championships.find(row=>row.season_tier_id===down.id);
  const finished=id=>{const tournament=id&&get('tournaments',id);return !!tournament&&['FINISHED','ARCHIVED'].includes(tournament.status);};
  let blocked=null;
  if(!up||!down) blocked='Tiers da fronteira não estão configurados.';
  else if(!upChamp||!downChamp) blocked='Configure os dois campeonatos principais antes de abrir a janela.';
  else if(!finished(upChamp.tournament_id)||!finished(downChamp.tournament_id)) blocked='Os campeonatos principais desta fronteira ainda não foram encerrados.';
  else if(window?.status==='CONFIRMED') blocked=null;
  return {transition_window_id:window?.id||null,boundary_code:code,upper_tier_code:upper,lower_tier_code:lower,status:window?.status||null,available:!blocked&&window?.status!=='CONFIRMED',blocked_reason:window?.status==='CONFIRMED'?null:blocked,promotion_spots:Number(ruleFor(rules,down?.id).promotion_spots||0),relegation_spots:Number(ruleFor(rules,up?.id).relegation_spots||0)};
 });
}

function snapshotWindow(season,window){
 const tiers=tiersOf(season.id);
 const upper=tiers.find(row=>row.id===window.upper_tier_id),lower=tiers.find(row=>row.id===window.lower_tier_id);
 const rules=rulesOf(configOf(season).id);
 const promo=Number(ruleFor(rules,lower.id).promotion_spots||0),releg=Number(ruleFor(rules,upper.id).relegation_spots||0);
 const existing=where('elo_v2_transition_window_teams','transition_window_id',window.id);
 if(existing.length) return window.id;
 const teams=activeTeams(season.id);
 const upperTeams=teams.filter(row=>row.season_tier_id===upper.id).sort((a,b)=>b.tier_position-a.tier_position).slice(0,Math.max(releg,teams.filter(row=>row.season_tier_id===upper.id).length));
 const lowerTeams=teams.filter(row=>row.season_tier_id===lower.id).sort((a,b)=>a.tier_position-b.tier_position);
 for(const row of upperTeams) save('elo_v2_transition_window_teams',{transition_window_id:window.id,team_id:row.team_id,origin_tier_id:upper.id,destination_tier_id:lower.id,selection_kind:'RELEGATION',official_elo_before:row.elo_rating,official_position_before:row.tier_position,selected:false});
 for(const row of lowerTeams) save('elo_v2_transition_window_teams',{transition_window_id:window.id,team_id:row.team_id,origin_tier_id:lower.id,destination_tier_id:upper.id,selection_kind:'PROMOTION',official_elo_before:row.elo_rating,official_position_before:row.tier_position,selected:false});
 return {promo,releg};
}

const handlers={
 fn_elo_admin_has_started_competition(user,p){const season=seasonOf(p.p_federation_season_id);requireManager(user,season);return competitionStarted(season);},
 fn_elo_admin_pending_teams(user,p){
  const season=seasonOf(p.p_federation_season_id);requireManager(user,season);
  const federation=get('federations',season.federation_id);
  return candidateTeams(season).map(team=>({team_id:team.id,team_name:team.name,team_tag:team.tag||null,emblem_object_key:team.emblem_object_key||null,tier_code:null,legacy_elo:null,federation_name:federation?.name||null}));
 },
 fn_elo_admin_place_team(user,p){return transaction(()=>{
  const season=seasonOf(p.p_federation_season_id);requireManager(user,season);assertEditable(season);
  const tier=get('elo_season_tiers',p.p_season_tier_id);
  if(!tier||tier.federation_season_id!==season.id) fail('Tier inválido.',400);
  const team=get('teams',p.p_team_id); if(!team) fail('Team não encontrado.',404);
  placeExisting(season,team.id,tier,p.p_tier_position);log(user,'elo_place_team','elo_season_teams',team.id);return {success:true};
 });},
 fn_elo_admin_place_all_pending_in_t3(user,p){return transaction(()=>{
  const season=seasonOf(p.p_federation_season_id);requireManager(user,season);assertEditable(season);
  return placePendingInT3(season);
 });},
 fn_elo_admin_finalize_organization(user,p){return transaction(()=>{
  const season=seasonOf(p.p_federation_season_id);requireManager(user,season);
  if(season.status==='CLOSED') fail('A Season está CLOSED.',409);
  const placed=season.status==='DRAFT'?placePendingInT3(season):0;
  if(season.status==='DRAFT') patch('elo_federation_seasons',season.id,{status:'READY',updated_at:now()});
  log(user,'elo_finalize','elo_federation_seasons',season.id);return {success:true,placed,status:'READY'};
 });},
 fn_elo_admin_update_season_config(user,p){return transaction(()=>{
  const season=seasonOf(p.p_federation_season_id);requireManager(user,season);assertEditable(season);
  const previous=configOf(season),version=save('elo_config_versions',{version_number:Number(previous.version_number||1)+1,created_at:now(),k_factor:p.p_k_factor,expectation_diff_cap:p.p_expectation_diff_cap,tier_gap:p.p_tier_gap,tie_policy:p.p_tie_policy||'manual',secondary_absence_percent:p.p_secondary_absence_percent,secondary_absence_max:p.p_secondary_absence_max});
  const tiers=Object.fromEntries(tiersOf(season.id).map(row=>[row.code,row]));
  const spec={T1:[p.p_t1_max_teams,p.p_t1_initial_elo,null,p.p_t1_promotion_spots,p.p_t1_relegation_spots],T2:[p.p_t2_max_teams,p.p_t2_initial_elo,null,p.p_t2_promotion_spots,p.p_t2_relegation_spots],T3:[null,p.p_t3_initial_elo,p.p_t3_floor_elo,p.p_t3_promotion_spots,p.p_t3_relegation_spots]};
  for(const [code,tier] of Object.entries(tiers)){const [max,initial,floor,promo,releg]=spec[code]||[];save('elo_tier_version_rules',{config_version_id:version.id,season_tier_id:tier.id,max_teams:max??null,initial_elo:initial??0,floor_elo:floor??null,promotion_spots:promo??0,relegation_spots:releg??0,created_at:now()});}
  patch('elo_federation_seasons',season.id,{current_config_version_id:version.id,updated_at:now()});
  log(user,'elo_config','elo_config_versions',version.id);return {success:true,config_version_id:version.id};
 });},
 fn_initialize_elo_federation_season(user,p){return transaction(()=>{
  if(!canManageElo(user,p.p_federation_id)) fail(!user?'Faça login para continuar.':'Acesso administrativo necessário.',user?403:401);
  const existing=all('elo_federation_seasons').find(row=>row.federation_id===p.p_federation_id&&row.season_id===p.p_season_id);
  if(existing) return existing.id;
  const season=save('elo_federation_seasons',{federation_id:p.p_federation_id,season_id:p.p_season_id,status:'DRAFT',previous_federation_season_id:p.p_previous_federation_season_id||null,created_at:now(),updated_at:now()});
  const version=save('elo_config_versions',{version_number:1,created_at:now(),k_factor:20,expectation_diff_cap:400,tier_gap:50,tie_policy:'manual',secondary_absence_percent:10,secondary_absence_max:3});
  const defaults=[{code:'T1',name:'TIER 1',rank:1,max:12,elo:2200,floor:null,promo:0,releg:2},{code:'T2',name:'TIER 2',rank:2,max:12,elo:2000,floor:null,promo:2,releg:3},{code:'T3',name:'TIER 3',rank:3,max:null,elo:1800,floor:1500,promo:3,releg:0}];
  for(const item of defaults){const tier=save('elo_season_tiers',{federation_season_id:season.id,code:item.code,name:item.name,rank:item.rank,active:true,created_at:now(),updated_at:now()});save('elo_tier_version_rules',{config_version_id:version.id,season_tier_id:tier.id,max_teams:item.max,initial_elo:item.elo,floor_elo:item.floor,promotion_spots:item.promo,relegation_spots:item.releg,created_at:now()});}
  patch('elo_federation_seasons',season.id,{current_config_version_id:version.id});
  if(!where('elo_season_routes','season_id',p.p_season_id).length) save('elo_season_routes',{season_id:p.p_season_id,engine_version:'V2',created_at:now()});
  log(user,'elo_initialize','elo_federation_seasons',season.id);return season.id;
 });},
 fn_bootstrap_elo_v2_from_legacy(user,p){return transaction(()=>{
  const season=seasonOf(p.p_federation_season_id);requireManager(user,season);
  if(activeTeams(season.id).length) fail('Season already has Teams',409);
  const placed=placePendingInT3(season);
  return {success:true,placed};
 });},
 fn_elo_admin_close_preflight(user,p){
  const season=seasonOf(p.p_federation_season_id);requireManager(user,season);
  const blockers=[];
  if(season.status==='DRAFT') blockers.push('A organização ainda não foi finalizada.');
  if(season.status==='CLOSED') blockers.push('A Season já está encerrada.');
  if(candidateTeams(season).length) blockers.push('Ainda existem Teams pendentes de organização.');
  const open=where('elo_v2_transition_windows','federation_season_id',season.id).filter(row=>row.status&&row.status!=='CONFIRMED');
  if(open.length) blockers.push('Existe uma janela de transição aberta.');
  for(const item of windowsFor(season)) if((item.promotion_spots||item.relegation_spots)&&item.status!=='CONFIRMED'&&!item.blocked_reason) blockers.push('A janela '+item.boundary_code+' ainda não foi confirmada.');
  if(!competitionStarted(season)&&season.status!=='CLOSED') blockers.push('Nenhuma competição desta Season foi iniciada.');
  return {can_close:blockers.length===0&&season.status!=='CLOSED',blockers};
 },
 fn_elo_admin_close_federation_season(user,p){return transaction(()=>{
  const season=seasonOf(p.p_federation_season_id);requireManager(user,season);
  const check=handlers.fn_elo_admin_close_preflight(user,p);
  if(!check.can_close) fail(check.blockers[0]||'A Season não pode ser encerrada.',409);
  patch('elo_federation_seasons',season.id,{status:'CLOSED',closed_at:now(),updated_at:now()});
  log(user,'elo_close','elo_federation_seasons',season.id);return {success:true};
 });},
 fn_elo_admin_penalty_events(user,p){const season=seasonOf(p.p_federation_season_id);requireManager(user,season);return where('elo_penalty_events','federation_season_id',season.id).sort((a,b)=>String(b.effective_at).localeCompare(String(a.effective_at)));},
 fn_elo_admin_penalty_preview(user,p){
  const season=seasonOf(p.p_federation_season_id);requireManager(user,season);
  if(season.status==='CLOSED') fail('A Season está CLOSED.',409);
  const team=activeTeams(season.id).find(row=>row.team_id===p.p_team_id); if(!team) fail('Team não está ativo nesta Season.',404);
  const tournament=get('tournaments',p.p_tournament_id);
  if(!tournament||tournament.federation_id!==season.federation_id||tournament.ranking_season_id!==season.season_id||!tournament.elo_ranking_enabled) fail('Tournament inválido para esta Federation Season.',400);
  const tiers=tiersOf(season.id),origin=tiers.find(row=>row.id===team.season_tier_id),config=configOf(season),rules=rulesOf(config.id);
  const championship=where('elo_v2_tier_championships','federation_season_id',season.id).find(row=>row.season_tier_id===origin.id);
  const principal=championship?.tournament_id===tournament.id;
  if(p.p_penalty_type==='MAIN_TIER_ABSENCE'&&!principal) fail('Ausência principal exige o campeonato principal do Tier atual.',400);
  if(p.p_penalty_type==='SECONDARY_ABSENCE'&&principal) fail('Ausência secundária não pode usar o campeonato principal do Tier.',400);
  if(!['MAIN_TIER_ABSENCE','SECONDARY_ABSENCE'].includes(p.p_penalty_type)) fail('Tipo de penalidade inválido.',400);
  const prior=where('elo_penalty_events','federation_season_id',season.id).filter(row=>row.team_id===team.team_id&&row.penalty_type==='SECONDARY_ABSENCE');
  let destination=origin,elo=Number(team.elo_rating||0),occurrence=null,percent=null;
  if(p.p_penalty_type==='SECONDARY_ABSENCE'){
   occurrence=prior.length+1; percent=Number(config.secondary_absence_percent||0);
   if(config.secondary_absence_max!=null&&occurrence>Number(config.secondary_absence_max)) fail('O máximo de ausências secundárias desta Season foi atingido.',409);
   elo=Math.round(elo*(1-percent/100));
   const floor=ruleFor(rules,origin.id).floor_elo; if(floor!=null) elo=Math.max(elo,Number(floor));
  }else{
   const index=tiers.findIndex(row=>row.id===origin.id);
   destination=tiers[Math.min(tiers.length-1,index+1)]||origin;
   elo=Number(ruleFor(rules,destination.id).initial_elo||0);
  }
  return {penalty_type:p.p_penalty_type,effective_at:p.p_effective_at,tier_before:origin.code,elo_before:Number(team.elo_rating||0),tier_after:destination.code,elo_after:elo,secondary_occurrence_number:occurrence,secondary_absence_max:config.secondary_absence_max??null,penalty_percent:percent};
 },
 fn_elo_admin_confirm_penalty(user,p){return transaction(()=>{
  const preview=handlers.fn_elo_admin_penalty_preview(user,p);
  const season=seasonOf(p.p_federation_season_id),team=activeTeams(season.id).find(row=>row.team_id===p.p_team_id);
  const tournament=get('tournaments',p.p_tournament_id),club=get('teams',p.p_team_id);
  const tiers=tiersOf(season.id),destination=tiers.find(row=>row.code===preview.tier_after);
  if(preview.tier_after!==preview.tier_before){
   const count=activeTeams(season.id).filter(row=>row.season_tier_id===destination.id&&row.team_id!==team.team_id).length;
   placeExisting(season,team.team_id,destination,count+1);
  }
  patch('elo_season_teams',get('elo_season_teams',team.id)?.id||team.id,{elo_rating:preview.elo_after,updated_at:now()});
  const event=save('elo_penalty_events',{federation_season_id:season.id,team_id:team.team_id,team_name:club?.name||team.team_id,tournament_id:tournament.id,tournament_name:tournament.name,penalty_type:preview.penalty_type,effective_at:preview.effective_at,reason:p.p_reason||'',tier_before:preview.tier_before,elo_before:preview.elo_before,tier_after:preview.tier_after,elo_after:preview.elo_after,created_at:now()});
  log(user,'elo_penalty','elo_penalty_events',event.id);return {success:true,id:event.id};
 });},
 fn_elo_admin_principal_tournament_candidates(user,p){
  const season=seasonOf(p.p_federation_season_id);requireManager(user,season);
  const rows=[];
  for(const tournament of all('tournaments')){
   if(tournament.federation_id!==season.federation_id||tournament.ranking_season_id!==season.season_id||!tournament.elo_ranking_enabled) continue;
   const tier=tierCodeOfTournament(tournament),codes=tier?[tier]:['T1','T2','T3'];
   for(const code of codes) rows.push({tournament_id:tournament.id,tournament_name:tournament.name,tournament_status:tournament.status,starts_at:tournament.starts_at||null,tier_code:code});
  }
  return rows;
 },
 fn_elo_admin_set_tier_championship(user,p){return transaction(()=>{
  const season=seasonOf(p.p_federation_season_id);requireManager(user,season);
  if(season.status==='CLOSED') fail('A Season está CLOSED.',409);
  const tier=get('elo_season_tiers',p.p_season_tier_id); if(!tier||tier.federation_season_id!==season.id) fail('Tier inválido.',400);
  const tournament=get('tournaments',p.p_tournament_id);
  if(!tournament||tournament.federation_id!==season.federation_id||tournament.ranking_season_id!==season.season_id) fail('Tournament inválido para esta Season.',400);
  const old=where('elo_v2_tier_championships','federation_season_id',season.id).find(row=>row.season_tier_id===tier.id);
  const row=save('elo_v2_tier_championships',{...(old||{}),federation_season_id:season.id,season_tier_id:tier.id,tournament_id:tournament.id,updated_at:now()});
  return {success:true,id:row.id};
 });},
 fn_elo_admin_transition_windows(user,p){const season=seasonOf(p.p_federation_season_id);requireManager(user,season);return windowsFor(season);},
 fn_elo_admin_prepare_transition_window(user,p){return transaction(()=>{
  const season=seasonOf(p.p_federation_season_id);requireManager(user,season);
  if(!competitionStarted(season)) fail('A janela só abre depois que a competição começou.',409);
  const upper=get('elo_season_tiers',p.p_upper_tier_id),lower=get('elo_season_tiers',p.p_lower_tier_id);
  if(!upper||!lower||upper.federation_season_id!==season.id||lower.federation_season_id!==season.id) fail('Tiers inválidos.',400);
  const boundary=upper.code+'_'+lower.code;
  const info=windowsFor(season).find(row=>row.boundary_code===boundary);
  if(!info) fail('Fronteira inválida.',400);
  if(info.blocked_reason) fail(info.blocked_reason,409);
  const existing=where('elo_v2_transition_windows','federation_season_id',season.id).find(row=>row.boundary_code===boundary);
  if(existing?.status==='CONFIRMED') fail('Esta janela já foi confirmada.',409);
  const window=existing||save('elo_v2_transition_windows',{federation_season_id:season.id,boundary_code:boundary,upper_tier_id:upper.id,lower_tier_id:lower.id,status:'PREPARING',created_at:now()});
  if(!existing) snapshotWindow(season,window);
  return window.id;
 });},
 fn_elo_admin_select_transition_teams(user,p){return transaction(()=>{
  const window=get('elo_v2_transition_windows',p.p_transition_window_id); if(!window) fail('Janela não encontrada.',404);
  const season=seasonOf(window.federation_season_id);requireManager(user,season);
  if(window.status==='CONFIRMED') fail('Esta janela já foi confirmada.',409);
  const info=windowsFor(season).find(row=>row.boundary_code===window.boundary_code);
  const promoted=[...new Set(p.p_promoted_team_ids||[])],relegated=[...new Set(p.p_relegated_team_ids||[])];
  if(promoted.length!==info.promotion_spots||relegated.length!==info.relegation_spots) fail('Selecione '+info.promotion_spots+' promovido(s) e '+info.relegation_spots+' rebaixado(s).',400);
  const rows=where('elo_v2_transition_window_teams','transition_window_id',window.id);
  for(const row of rows){const selected=row.selection_kind==='PROMOTION'?promoted.includes(row.team_id):relegated.includes(row.team_id);patch('elo_v2_transition_window_teams',row.id,{selected});}
  return {success:true};
 });},
 fn_elo_admin_transition_window_preview(user,p){
  const window=get('elo_v2_transition_windows',p.p_transition_window_id); if(!window) fail('Janela não encontrada.',404);
  const season=seasonOf(window.federation_season_id);requireManager(user,season);
  const tiers=Object.fromEntries(tiersOf(season.id).map(row=>[row.id,row]));
  const rules=rulesOf(configOf(season).id);
  const selected=where('elo_v2_transition_window_teams','transition_window_id',window.id).filter(row=>row.selected);
  const upper=tiers[window.upper_tier_id],lower=tiers[window.lower_tier_id];
  const relegated=selected.filter(row=>row.selection_kind==='RELEGATION');
  const promoted=selected.filter(row=>row.selection_kind==='PROMOTION');
  const upInitial=Number(ruleFor(rules,upper.id).initial_elo||0),downInitial=Number(ruleFor(rules,lower.id).initial_elo||0);
  const upCount=activeTeams(season.id).filter(row=>row.season_tier_id===upper.id).length;
  return [...promoted.map((row,index)=>({row,elo:Math.max(Number(row.official_elo_before||0),upInitial),position:upCount-relegated.length+index+1})),...relegated.map((row,index)=>({row,elo:downInitial,position:index+1}))].map(item=>{
   const team=get('teams',item.row.team_id),origin=tiers[item.row.origin_tier_id],destination=tiers[item.row.destination_tier_id];
   return {team_id:item.row.team_id,team_name:team?.name||item.row.team_id,selection_kind:item.row.selection_kind,origin_tier_code:origin?.code,destination_tier_code:destination?.code,elo_before:item.row.official_elo_before,elo_after:item.elo,position_before:item.row.official_position_before,position_after:item.position};
  });
 },
 fn_elo_admin_confirm_transition_window(user,p){return transaction(()=>{
  const preview=handlers.fn_elo_admin_transition_window_preview(user,p);
  const window=get('elo_v2_transition_windows',p.p_transition_window_id);
  if(window.status!=='PREPARING') fail('A janela não está pronta para confirmação.',409);
  if(!preview.length) fail('Selecione os Teams antes de confirmar.',400);
  const season=seasonOf(window.federation_season_id);
  const ordered=[...preview].sort((a,b)=>Number(a.selection_kind!=='RELEGATION')-Number(b.selection_kind!=='RELEGATION'));
  for(const item of ordered){
   const tier=tiersOf(season.id).find(row=>row.code===item.destination_tier_code);
   const membership=activeTeams(season.id).find(row=>row.team_id===item.team_id);
   placeExisting(season,item.team_id,tier,item.position_after);
   const updated=activeTeams(season.id).find(row=>row.team_id===item.team_id)||membership;
   patch('elo_season_teams',updated.id,{elo_rating:item.elo_after,updated_at:now()});
  }
  patch('elo_v2_transition_windows',window.id,{status:'CONFIRMED',confirmed_at:now()});
  log(user,'elo_transition','elo_v2_transition_windows',window.id);return {success:true};
 });}
};

export function eloAdminRpc(name,p,user){
 if(!handlers[name]) return undefined;
 repairEloCatalog();
 return handlers[name](user,p||{});
}

function norm(value){return String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();}
function similarity(a,b){
 a=norm(a); b=norm(b); if(!a||!b) return 0; if(a===b) return 1;
 const grams=text=>{const out=[],padded=' '+text+' ';for(let i=0;i<padded.length-1;i++)out.push(padded.slice(i,i+2));return out;};
 const left=grams(a),right=grams(b),bag=new Map();
 for(const gram of right) bag.set(gram,(bag.get(gram)||0)+1);
 let shared=0; for(const gram of left){const count=bag.get(gram)||0; if(count){shared++;bag.set(gram,count-1);}}
 return (2*shared)/(left.length+right.length);
}
function classify(score){return score>=0.72?'COMPATIBLE':score>=0.4?'DIFFERENT':'VERY_DIFFERENT';}
function costRow(key){return all('field_edit_costs').find(row=>row.entity_type==='team'&&row.field_key===key&&row.active)||null;}

function clubQuote(team,clubName){
 const season=all('ranking_seasons').find(row=>row.is_active&&(!team.game_id||row.game_id===team.game_id));
 const events=where('team_club_id_events','team_id',team.id).filter(row=>(row.season_id||null)===(season?.id||null));
 const free=Number(costRow('club_id_free_changes_per_season')?.free_edit_count??1);
 const changeNumber=events.length+1;
 const changeCost=changeNumber<=free?0:Number(costRow('club_id_change_cost')?.credit_cost||0);
 const kind=clubName?classify(similarity(team.name,clubName)):'COMPATIBLE';
 const similarityCost=kind==='DIFFERENT'?Number(costRow('club_id_different_cost')?.credit_cost||0):kind==='VERY_DIFFERENT'?Number(costRow('club_id_very_different_cost')?.credit_cost||0):0;
 return {previous_change_count:events.length,next_change_number:changeNumber,change_number:changeNumber,change_cost:changeCost,similarity:kind,similarity_cost:similarityCost,total_cost:changeCost+similarityCost,elo_penalty:0,renews_per_season:true,season_id:season?.id||null};
}

export function previewTeamClub(user,p){
 if(!user) fail('Faça login para continuar.',401);
 const team=get('teams',p.p_team_id); if(!team) fail('Equipe não encontrada.',404);
 if(user.role!=='admin'&&team.owner_user_id!==user.id) fail('Sem permissão.',403);
 const clubId=Number(p.p_new_club_id); if(!Number.isSafeInteger(clubId)||clubId<=0) fail('Club ID inválido.',400);
 return clubQuote(team,p.p_new_club_name);
}

export function changeTeamClub(user,p){return transaction(()=>{
 const quote=previewTeamClub(user,p);
 const team=get('teams',p.p_team_id);
 const request=p.p_request_id?String(p.p_request_id):null;
 if(request){const prior=where('team_club_id_events','team_id',team.id).find(row=>row.request_id===request); if(prior) return {success:true,idempotent:true,total_cost:prior.total_cost,new_balance:prior.balance_after??null};}
 if(Number(team.clubsId)===Number(p.p_new_club_id)) fail('Este Club ID já está vinculado à equipe.',409);
 const wallet=ensureCredits(user); if(wallet.balance<quote.total_cost) fail('INSUFFICIENT_CREDITS',409);
 const balance=wallet.balance-quote.total_cost;
 if(quote.total_cost){patch('user_ai_credits',wallet.id,{balance,lifetime_used:(wallet.lifetime_used||0)+quote.total_cost});save('credit_transactions',{user_id:user.id,amount:-quote.total_cost,balance_after:balance,type:'club_id_change',description:'Troca de Club ID',operation_id:request,created_at:now()});}
 patch('teams',team.id,{clubsId:Number(p.p_new_club_id),eafc_club_name:p.p_new_club_name||null,eafc_club_platform:p.p_new_platform||team.eafc_club_platform||null,eafc_club_members:Array.isArray(p.p_new_members)?p.p_new_members:team.eafc_club_members||[]});
 const profile=where('users_profile','id',user.id)[0]||get('users_profile',user.id);
 save('team_club_id_events',{team_id:team.id,event_type:'CLUB_ID_CHANGE',previous_club_id:team.clubsId??null,new_club_id:Number(p.p_new_club_id),new_ea_name:p.p_new_club_name||null,actor_role:user.role,actor_display_name:profile?.display_name||user.email||user.id,change_number:quote.change_number,total_cost:quote.total_cost,elo_penalty:0,season_id:quote.season_id,request_id:request,balance_after:balance,created_at:now()});
 log(user,'club_id_change','teams',team.id);return {success:true,total_cost:quote.total_cost,new_balance:balance,similarity:quote.similarity};
});}

function clamp(value){return Math.max(1,Math.min(99,Math.round(value)));}
function rarity(overall){return overall>=90?'legend':overall>=80?'epic':overall>=70?'rare':overall>=60?'uncommon':'common';}
export function calcCardStats(p){
 const id=p.p_player_profile_id; if(!id) fail('Jogador não informado.',400);
 const rows=where('match_eafc_newgen_player_stats','player_profile_id',id);
 const blank={overall:50,shooting:50,passing:50,defense:50,mvp_score:50,win_rate:50,rating:50,rarity:'common'};
 if(!rows.length){
  const imported=where('player_imported_stats','player_profile_id',id)[0]; if(!imported) return blank;
  const matches=Math.max(1,Number(imported.total_matches||0));
  const rating=clamp((Number(imported.avg_rating)||5)*10);
  const shooting=clamp(40+Number(imported.total_goals||0)/matches*25);
  const mvp=clamp(100*Number(imported.total_mvp||0)/matches);
  const overall=clamp((rating+shooting+50+50)/4);
  return {overall,shooting,passing:50,defense:50,mvp_score:mvp,win_rate:50,rating,rarity:rarity(overall)};
 }
 const avg=key=>rows.reduce((sum,row)=>sum+(Number(row[key])||0),0)/rows.length;
 const rating=clamp(avg('rating')*10);
 const shooting=clamp(35+avg('goals')*18+Math.min(avg('shots'),8)*3);
 const attempts=avg('pass_attempts');
 const passing=clamp((attempts>0?avg('passes_made')/attempts:0.5)*99);
 const defense=clamp(40+avg('tackles_made')*8+avg('saves')*4);
 const mvp=clamp(100*rows.filter(row=>row.mom).length/rows.length);
 let wins=0,decided=0;
 for(const row of rows){const raw=row.raw_player_json||{}; if(raw.wins!=null||raw.losses!=null){wins+=Number(raw.wins)||0; decided+= (Number(raw.wins)||0)+(Number(raw.losses)||0);}}
 const winRate=decided?clamp(100*wins/decided):50;
 const overall=clamp(rating*0.4+shooting*0.2+passing*0.2+defense*0.2);
 return {overall,shooting,passing,defense,mvp_score:mvp,win_rate:winRate,rating,rarity:rarity(overall)};
}

export function featureRecruitmentAd(user,p){return transaction(()=>{
 if(!user) fail('Faça login para continuar.',401);
 const ad=get('recruitment_ads',p.p_ad_id); if(!ad) fail('Anúncio não encontrado.',404);
 if(ad.user_id!==user.id&&user.role!=='admin') fail('Sem permissão.',403);
 if(ad.status==='CLOSED') fail('Anúncio encerrado.',409);
 if(ad.featured_until&&Date.parse(ad.featured_until)>Date.now()) return {success:true,cost:0,featured_until:ad.featured_until,new_balance:where('user_ai_credits','user_id',user.id)[0]?.balance??null};
 const key=String(ad.ad_type||'').toLowerCase().includes('player')?'recruitment_player_featured':'recruitment_team_featured';
 const feature=where('ai_feature_costs','feature_key',key).find(row=>row.active);
 const cost=Number(feature?.credit_cost??0);
 const wallet=ensureCredits(user); if(wallet.balance<cost) fail('INSUFFICIENT_CREDITS',409);
 const balance=wallet.balance-cost;
 if(cost){patch('user_ai_credits',wallet.id,{balance,lifetime_used:(wallet.lifetime_used||0)+cost});save('credit_transactions',{user_id:user.id,amount:-cost,balance_after:balance,type:'recruitment_feature',feature_key:key,description:feature?.feature_label||key,created_at:now()});}
 const featured_until=new Date(Date.now()+7*86400000).toISOString();
 patch('recruitment_ads',ad.id,{featured:true,featured_until,status:ad.status||'OPEN'});
 log(user,'feature_ad','recruitment_ads',ad.id);return {success:true,cost,featured_until,new_balance:balance};
});}

export function recalcShooterLeaderboard(user,p){return transaction(()=>{
 if(!user) fail('Faça login para continuar.',401);
 const tournament=get('tournaments',p.p_tournament_id); if(!tournament) fail('Campeonato não encontrado.',404);
 if(user.role!=='admin'&&tournament.created_by_user_id!==user.id) fail('Sem permissão.',403);
 const config=where('shooter_points_config','tournament_id',tournament.id)[0]||{};
 const weight={kills:config.points_per_kill??1,assists:config.points_per_assist??0.5,damage:config.points_per_damage??0,headshots:config.points_per_headshot??0,revives:config.points_per_revive??0,team_wipe:config.points_per_team_wipe??0};
 const groups=new Map();
 for(const report of where('shooter_match_reports','tournament_id',tournament.id)){
  if(!report.validated) continue;
  const key=report.player_id||report.team_id; if(!key) continue;
  const row=groups.get(key)||{player_id:report.player_id||null,team_id:report.team_id||null,total_points:0,total_kills:0,total_assists:0,total_damage:0,total_headshots:0,total_revives:0,total_team_wipes:0,total_matches:0,placement_sum:0,placement_n:0};
  row.total_kills+=Number(report.kills)||0; row.total_assists+=Number(report.assists)||0; row.total_damage+=Number(report.damage)||0; row.total_headshots+=Number(report.headshots)||0; row.total_revives+=Number(report.revives)||0; row.total_team_wipes+=Number(report.team_wipe)||0; row.total_matches++;
  if(report.placement!=null&&report.placement!==''){row.placement_sum+=Number(report.placement)||0; row.placement_n++;}
  row.total_points+=rowWeight(report,weight,config); groups.set(key,row);
 }
 for(const old of where('shooter_leaderboard','tournament_id',tournament.id)) remove('shooter_leaderboard',old.id);
 const ranked=[...groups.values()].sort((a,b)=>b.total_points-a.total_points||b.total_kills-a.total_kills);
 ranked.forEach((row,index)=>save('shooter_leaderboard',{tournament_id:tournament.id,player_id:row.player_id,team_id:row.team_id,rank_position:index+1,total_points:row.total_points,total_kills:row.total_kills,total_assists:row.total_assists,total_damage:row.total_damage,total_headshots:row.total_headshots,total_matches:row.total_matches,avg_placement:row.placement_n?row.placement_sum/row.placement_n:null,updated_at:now()}));
 log(user,'shooter_recalc','shooter_leaderboard',tournament.id);return {success:true,rows:ranked.length};
});}
function rowWeight(report,weight,config){
 let points=(Number(report.kills)||0)*weight.kills+(Number(report.assists)||0)*weight.assists+(Number(report.damage)||0)*weight.damage+(Number(report.headshots)||0)*weight.headshots+(Number(report.revives)||0)*weight.revives+(Number(report.team_wipe)||0)*weight.team_wipe;
 if(report.placement!=null&&report.placement!==''){const table=config.placement_points||{}; const custom=table[String(report.placement)]; points+=custom!=null?Number(custom):Math.max(0,21-Number(report.placement));}
 return points;
}

export const externalAiDisabled=!process.env.OPENAI_API_KEY&&!process.env.AI_API_KEY&&!process.env.FC_AI_API_KEY;
export function externalAiFeature(featureKey){return /^(ai_tournament_|avatar_|banner_ai$|bg_remove$|card_ai_|emblem_ai_)/.test(String(featureKey||''));}
