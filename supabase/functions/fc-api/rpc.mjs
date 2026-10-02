import {buyAvatar,decideAvatarOffer} from './avatar-market.mjs';
import {clock,stableRandom,isHydration} from './db.mjs';
import { fieldQuote,applyFieldEdits } from './field-edits.mjs';
import { importRows } from './imports.mjs';
import { subscriptionStatus,spendCredits } from './credits.mjs';
import { validateTransfer } from './transfers.mjs';
import { all,db,where,get,save,patch,remove,transaction } from './db.mjs';
import { transferPlayer } from './competition.mjs';
import { transferOwnership,reviewOrganization,updateAchievementIcon } from './admin.mjs';
import {rankingRows,performerCareer,topPerformers,playerIcons} from './rankings.mjs';
import {canManageElo,eloAdminRpc,previewTeamClub,changeTeamClub,calcCardStats,featureRecruitmentAd,recalcShooterLeaderboard} from './elo-admin.mjs';
const error=(m,status=400)=>{throw Object.assign(new Error(m),{status});};
export function rpc(name,p,user){
 if(name==='fn_transfer_team_ownership')return transferOwnership(user,p.p_team_id,p.p_new_owner_id);
 if(name==='review_organization_request')return reviewOrganization(user,p);
 if(name==='fn_admin_update_performance_achievement_icon')return updateAchievementIcon(user,p);
 if(name==='fn_rnk_top_trophies')return all('rpc_fn_rnk_top_trophies').slice(0,p.p_limit||10);
 if(name==='fn_recruitment_public_feed')return all('recruitment_ads').filter(r=>r.status!=='CLOSED'&&(!p.p_game_id||r.game_id===p.p_game_id)&&(!p.p_ad_type||r.ad_type===p.p_ad_type)&&(!p.p_country_id||r.country_id===p.p_country_id)&&(!p.p_primary_position_id||r.primary_position_id===p.p_primary_position_id)).sort((a,b)=>Number(Date.parse(b.featured_until)>clock())-Number(Date.parse(a.featured_until)>clock())||String(b.created_at||'').localeCompare(String(a.created_at||''))).slice(p.p_offset||0,(p.p_offset||0)+(p.p_limit||50));
 if(name==='fn_player_titles_list'){const roster=where('manual_title_roster','player_profile_id',p.p_player_profile_id);return roster.map(r=>({...get('manual_titles',r.manual_title_id||r.title_id),...r}));}
 if(name==='fn_top_performer_career')return performerCareer(p.p_player_profile_id);
 if(name==='fn_top_performers_highlight')return topPerformers();
 if(name==='fn_rnk_player_season_rows')return rankingRows(p.p_season_id);
 if(name==='fn_season_pro_players_icons')return playerIcons(p);
 if(name==='fn_rnk_ensure_fresh')return {success:true,rows:rankingRows(p.p_season_id).length};
 if(name==='fn_can_manage_elo_federation')return canManageElo(user,p.p_federation_id);
 if(name==='fn_calc_card_stats')return calcCardStats(p||{});
 if(name.startsWith('fn_elo_')||name==='fn_initialize_elo_federation_season'||name==='fn_bootstrap_elo_v2_from_legacy'){const elo=eloAdminRpc(name,p,user); if(elo!==undefined)return elo;}
 if(!user)error('Faça login para continuar.',401);
 if(name==='fn_field_edit_quote')return fieldQuote(user,p);
 if(name==='fn_apply_field_edits')return applyFieldEdits(user,p);
 if(name==='fn_admin_transfer_player'){if(user.role!=='admin')error('Acesso administrativo necessário.',403);return transferPlayer(user,p.p_player_profile_id,p.p_destination_team_id,p.p_reason);}
 if(name==='fn_remove_team_player'){const team=get('teams',p.p_team_id),profile=get('player_profiles',p.p_player_profile_id);if(user.role!=='admin'&&team?.owner_user_id!==user.id&&profile?.user_id!==user.id)error('Sem permissão.',403);if(!where('team_players','player_profile_id',p.p_player_profile_id).some(r=>r.team_id===p.p_team_id))error('Jogador não pertence à equipe.');return {success:true,...transferPlayer(user,p.p_player_profile_id,null,'Saída do elenco')};}
 if(name==='fn_accept_team_invite'){
  const invite=get('team_invites',p.p_invite_id);if(!invite)error('Convite não encontrado.',404);const player=get('player_profiles',invite.invited_profile_id||invite.player_profile_id);if(player?.user_id!==user.id&&user.role!=='admin')error('Este convite pertence a outro jogador.',403);if(invite.status!=='PENDING')error('Convite já respondido.',409);if(p.p_expected_team_id&&invite.team_id!==p.p_expected_team_id)error('Equipe não corresponde ao convite.');
  const entry=transferPlayer(user,player.id,invite.team_id,'Convite aceito',invite.id);return {success:true,...entry};
 }
 if(name.startsWith('fn_recruitment_')){
  if(name==='fn_recruitment_last_template')return where('recruitment_ads','user_id',user.id).at(-1)||null;
  if(name==='fn_recruitment_create_ad'){const data=Object.fromEntries(Object.entries(p).map(([k,v])=>[k.replace(/^p_/,''),v]));return save('recruitment_ads',{...data,user_id:user.id,status:'OPEN',created_at:new Date(clock()).toISOString()});}
  const ad=get('recruitment_ads',p.p_ad_id);if(!ad)error('Anúncio não encontrado.',404);if(ad.user_id!==user.id&&user.role!=='admin')error('Sem permissão.',403);
  if(name==='fn_recruitment_close_ad'||name==='fn_recruitment_admin_remove_ad')return patch('recruitment_ads',ad.id,{status:'CLOSED'});
  if(name==='fn_recruitment_update_ad')return patch('recruitment_ads',ad.id,Object.fromEntries(Object.entries(p).filter(([k])=>!['p_user_id','p_id'].includes(k)).map(([k,v])=>[k.replace(/^p_/,''),v])));
  if(name==='fn_recruitment_feature_ad')return featureRecruitmentAd(user,p);
 }
 if(name==='fn_preview_team_club_id_change')return previewTeamClub(user,p);
 if(name==='fn_change_team_club_id')return changeTeamClub(user,p);
 if(name==='fn_shooter_recalc_leaderboard')return recalcShooterLeaderboard(user,p);
 error('Operação ainda não implementada no backend: '+name,501);
}

function searchUsers(user,p){if(!user)error('Faça login.',401);const q=String(p.query||'').trim().toLowerCase();if(q==='@@all@@'&&user.role!=='admin')error('Sem permissão.',403);return all('users_profile').filter(r=>q==='@@all@@'||q.length>=2&&(String(r.display_name||r.full_name||'').toLowerCase().includes(q)||(user.role==='admin'&&String(r.email||'').toLowerCase().includes(q)))).slice(0,q==='@@all@@'?10000:20).map(r=>({user_id:r.id,display_name:r.display_name||r.full_name||'',email:user.role==='admin'?r.email:null}));}
function searchEntrants(p){const type=p.type==='player'?'player':'team',rows=all(type==='player'?'player_profiles':'teams').filter(r=>(!p.game_id||!r.game_id||r.game_id===p.game_id)&&(!p.country_id||!r.country_id||r.country_id===p.country_id)),fields=type==='player'?['handle','platform_handle']:['name','tag','eafc_club_name'],found=[],not_found=[];for(const name of [...new Set((p.names||[]).map(String))].slice(0,50)){const q=name.trim().toLowerCase();let selected=rows.filter(r=>fields.some(k=>String(r[k]||'').toLowerCase()===q));if(!selected.length)selected=rows.filter(r=>fields.some(k=>String(r[k]||'').toLowerCase().includes(q)));if(q&&selected.length===1){const r=selected[0];found.push({id:r.id,name:r.name||r.handle||r.tag||name,type});}else not_found.push(name);}return {found,not_found};}
export function invoke(name,p,user){
 if(name==='buy-avatar-nft')return buyAvatar(user,p);
 if(name==='accept-offer')return decideAvatarOffer(user,p);
 if(name==='search-users')return searchUsers(user,p||{});
 if(name==='search-tournament-entrants')return searchEntrants(p||{});
 if(['import-users','import-profiles','import-teams','import-team-squads','import-player-profiles','import-player-stats','import-eafc-matches'].includes(name))return importRows(name,p,user);
 if(name==='check-subscription'){if(p.sync_with_stripe)error('STRIPE_SECRET_KEY is not set: integração de pagamentos não configurada.',503);return subscriptionStatus(user);}
 if(name==='spend-credits')return spendCredits(user,p);
 if(name==='record-organization-registration-origin')return {success:true};
 if(!user)error('Faça login para continuar.',401);
 if(name==='validate-transfer'){return validateTransfer(p,user);}
 if(name==='find-user-by-email'){if(user.role!=='admin')error('Sem permissão.',403);const found=all('users_profile').find(u=>String(u.email).toLowerCase()===String(p.email).trim().toLowerCase());return {found:!!found,user_id:found?.id||null,user:found||null};}
 if(name==='cancel-registration'){const r=get('registrations',p.registrationId),e=r&&get('entrants',r.entrant_id);if(!r)error('Inscrição não encontrada.',404);if(user.role!=='admin'&&get('teams',e?.team_id)?.owner_user_id!==user.id&&get('player_profiles',e?.player_profile_id)?.user_id!==user.id)error('Sem permissão.',403);patch('registrations',r.id,{status:'CANCELED'});return {success:true};}
 if(name==='draft-draw'){
  const draft=get('drafts',p.draft_id);if(!draft)error('Draft não encontrado.',404);if(user.role!=='admin'&&draft.created_by_user_id!==user.id)error('Sem permissão.',403);
  if(where('draft_draw_assignments','draft_id',draft.id).length)error('Draft já sorteado.',409);
  const teams=where('draft_teams','draft_id',draft.id),entries=where('draft_entries','draft_id',draft.id);if(teams.length<2||entries.length<teams.length)error('Cadastre equipes e jogadores suficientes.');
  for(let i=entries.length-1;i>0;i--){const j=Math.floor(stableRandom()*(i+1));[entries[i],entries[j]]=[entries[j],entries[i]];}
  return transaction(()=>{entries.forEach((entry,i)=>save('draft_draw_assignments',{draft_id:draft.id,draft_entry_id:entry.id,player_profile_id:entry.player_profile_id,draft_team_id:teams[i%teams.length].id}));patch('drafts',draft.id,{status:'DRAWN'});return {success:true};});
 }
 if(name==='stripe-connect-status')return {connected:false,disabled:true,charges_enabled:false,payouts_enabled:false,details_submitted:false,reason:'Stripe não está configurado no backend. Nenhuma cobrança foi efetuada.'};
 if(name==='stripe-connect-account'||name==='stripe-connect-onboarding')return {disabled:true,error:'Stripe não está configurado no backend. Nenhuma cobrança foi efetuada.'};
 if(name==='ai-tournament-builder')error('Provedor de IA não configurado no backend. Nenhum crédito deve ser usado e nada foi gerado.',503);
 if(/checkout|stripe|pix|credits|purchase|customer-portal|subscription/.test(name))error('Integração de pagamentos não configurada. Nenhuma cobrança foi efetuada.',503);
 if(/generate-|read-match-image|suggest-card/.test(name))error('Provedor de geração de imagens/IA não configurado. Nada foi gerado.',503);
 error('Serviço externo não configurado: '+name,501);
}
