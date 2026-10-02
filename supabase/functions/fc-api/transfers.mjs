import {clock,stableRandom,isHydration} from './db.mjs';
import {get,where,all} from './db.mjs';
const active=new Set(['RUNNING','REG_OPEN','PUBLISHED']);
export const transferDefaults={auto_open_on_finish:true,require_admin_approval:false,auto_lock_on_playoffs:'NONE',allow_invite_during_partial:true,allow_leave_during_partial:false,allow_free_agent_during_full:false,enable_paid_exception_full_lock:false,credit_cost_cross_tier:0,max_invites_per_window:0,max_accepts_per_window:0,max_roster_size:0,allow_cross_tournament_transfer:true,block_transfer_if_played:false,cooldown_hours_after_transfer:0};
export function validateTransfer(p,user,now=clock()){
 const deny=reason=>({allowed:false,valid:false,reason});
 if(!user)return deny('Faça login para continuar.');
 const player=get('player_profiles',p.player_profile_id);
 if(!player)return deny('Jogador não encontrado.');
 const memberships=where('team_players','player_profile_id',player.id),from=memberships[0]?.team_id||null,to=p.to_team_id?get('teams',p.to_team_id):null;
 if(p.to_team_id&&!to)return deny('Equipe não encontrada.');
 if(to&&player.game_id!==to.game_id)return deny('Jogador e equipe devem ser do mesmo jogo.');
 if(to&&memberships.some(m=>m.team_id===to.id))return deny('Jogador já pertence à equipe.');
 const action=String(p.action_type||p.action||(to?'ACCEPT':'LEAVE')).toUpperCase();
 if(!['INVITE','ACCEPT','LEAVE','REMOVE'].includes(action))return deny('Tipo de movimentação inválido.');
 const ids=[from,to?.id].filter(Boolean),entrants=ids.flatMap(id=>where('entrants','team_id',id));
 let tournaments=[...new Set(entrants.map(e=>e.tournament_id))].map(id=>get('tournaments',id)).filter(t=>t&&active.has(t.status));
 if(p.tournament_id){const t=get('tournaments',p.tournament_id);if(!t)return deny('Torneio não encontrado.');if(!tournaments.some(x=>x.id===t.id)&&active.has(t.status))tournaments.push(t);}
 const bans=all('bans').filter(b=>b.active!==false&&(!b.starts_at||Date.parse(b.starts_at)<=now)&&(!b.ends_at||Date.parse(b.ends_at)>now)&&(b.player_profile_id===player.id||ids.includes(b.team_id)));
 for(const ban of bans)if(ban.is_global||tournaments.some(t=>t.federation_id===ban.federation_id))return deny('Jogador ou equipe possui banimento ativo.');
 for(const t of tournaments){
  const rules={...transferDefaults,...where('transfer_settings','federation_id',t.federation_id)[0]};
  let window=t.transfer_window_status||'OPEN';
  if(rules.auto_lock_on_playoffs!=='NONE'&&where('tournament_stages','tournament_id',t.id).some(s=>s.stage_type==='PLAYOFFS'&&where('match_series','stage_id',s.id).some(m=>m.status==='FINISHED'||m.status==='IN_PROGRESS')))window=rules.auto_lock_on_playoffs;
  if(window==='FULL_LOCK'&&!(rules.allow_free_agent_during_full&&!from&&to))return deny('Janela de transferências fechada: '+t.name);
  if(window==='PARTIAL_LOCK'&&((action==='INVITE'&&!rules.allow_invite_during_partial)||(['LEAVE','REMOVE'].includes(action)&&!rules.allow_leave_during_partial)||action==='ACCEPT'))return deny('Movimentação bloqueada pela janela parcial: '+t.name);
  if(rules.require_admin_approval&&user.role!=='admin')return deny('Esta transferência exige aprovação administrativa.');
  if(to&&rules.max_roster_size>0&&where('team_players','team_id',to.id).length>=rules.max_roster_size)return deny('O elenco de destino atingiu o limite de jogadores.');
  const history=where('transfer_logs','player_profile_id',player.id);
  if(rules.cooldown_hours_after_transfer>0&&history.some(r=>Date.parse(r.created_at)>now-rules.cooldown_hours_after_transfer*3600000))return deny('Aguarde o intervalo entre transferências.');
  const since=Date.parse(t.transfer_window_opened_at||t.starts_at||t.created_at||'1970-01-01');
  if(to&&action==='ACCEPT'&&rules.max_accepts_per_window>0&&where('transfer_logs','to_team_id',to.id).filter(r=>r.action_type==='ACCEPT'&&Date.parse(r.created_at)>=since).length>=rules.max_accepts_per_window)return deny('Limite de contratações da janela atingido.');
  if(to&&action==='INVITE'&&rules.max_invites_per_window>0&&where('team_invites','team_id',to.id).filter(r=>Date.parse(r.created_at)>=since).length>=rules.max_invites_per_window)return deny('Limite de convites da janela atingido.');
  if(from&&to&&!rules.allow_cross_tournament_transfer){const source=new Set(where('entrants','team_id',from).map(e=>e.tournament_id));if(!where('entrants','team_id',to.id).some(e=>source.has(e.tournament_id)))return deny('Transferências entre torneios não são permitidas.');}
  if(from&&rules.block_transfer_if_played&&where('player_match_stats','player_profile_id',player.id).some(r=>r.tournament_id===t.id||get('match_series',r.series_id||get('series_games',r.series_game_id)?.series_id)?.tournament_id===t.id))return deny('O jogador já disputou partidas neste torneio.');
 }
 return {allowed:true,valid:true,reason:'Transferência permitida'};
}
