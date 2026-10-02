import {get,where,all} from './db.mjs';
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
export function ownsEntrant(user,row){return !!user&&(row.team_id?get('teams',row.team_id)?.owner_user_id===user.id:row.player_profile_id?get('player_profiles',row.player_profile_id)?.user_id===user.id:false);}
export function participantCanWrite(user,table,row){
 if(table==='entrants')return get('tournaments',row.tournament_id)?.status==='REG_OPEN'&&ownsEntrant(user,row);
 if(table==='registrations')return (!row.status||row.status==='PENDING')&&get('tournaments',row.tournament_id)?.status==='REG_OPEN'&&ownsEntrant(user,get('entrants',row.entrant_id)||{});
 return false;
}
export function validateRegistrationInsert(table,input,user){
 if(!['entrants','registrations'].includes(table))return;
 const tournament=get('tournaments',input.tournament_id);if(!tournament)fail('Torneio não encontrado.',404);
 const manager=user?.role==='admin'||tournament.created_by_user_id===user?.id;
 if(!manager&&tournament.status!=='REG_OPEN')fail('Inscrições encerradas.',409);
 const entrant=table==='entrants'?input:get('entrants',input.entrant_id);
 if(!entrant||entrant.tournament_id!==tournament.id)fail('Participante não pertence ao torneio.');
 if(!!entrant.team_id===!!entrant.player_profile_id)fail('Informe exatamente um time ou jogador.');
 const participant=get(entrant.team_id?'teams':'player_profiles',entrant.team_id||entrant.player_profile_id);
 if(!participant)fail('Participante não encontrado.',404);
 if(participant.game_id!==tournament.game_id)fail('Participante e torneio devem ser do mesmo jogo.');
 const type=get('games',tournament.game_id)?.participant_type;
 if(type==='SOLO'&&!entrant.player_profile_id||type==='TEAM'&&!entrant.team_id)fail('Tipo de participante incompatível.');
 if(!manager&&!ownsEntrant(user,entrant))fail('Você não administra este participante.',403);
 if(table==='entrants'&&where('entrants','tournament_id',tournament.id).some(e=>entrant.team_id?e.team_id===entrant.team_id:e.player_profile_id===entrant.player_profile_id))fail('Participante já inscrito.',409);
 if(table==='registrations'&&where('registrations','entrant_id',entrant.id).some(r=>r.status!=='CANCELED'&&r.status!=='REJECTED'))fail('Inscrição já existente.',409);
 if(!manager&&table==='registrations'){
  if(input.status&&input.status!=='PENDING')fail('A aprovação depende da organização.',403);
  if(input.payment_status||input.paid_at||input.approved_by_user_id)fail('Dados de aprovação ou pagamento não permitidos.',403);
 }
 const now=Date.now();if(all('bans').some(b=>b.active!==false&&(entrant.team_id?b.team_id===entrant.team_id:b.player_profile_id===entrant.player_profile_id)&&(b.is_global||b.federation_id===tournament.federation_id)&&(!b.starts_at||Date.parse(b.starts_at)<=now)&&(!b.ends_at||Date.parse(b.ends_at)>now)))fail('Participante com banimento ativo.',409);
}
