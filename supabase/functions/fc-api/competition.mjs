import {clock,stableRandom,isHydration} from './db.mjs';
import { validateTransfer } from './transfers.mjs';
import {randomUUID} from './db.mjs';
import { get, save, where, patch, transaction, log } from './db.mjs';
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
const now=()=>new Date(clock()).toISOString();
export function roundRobin(ids,legs=1){
 if(new Set(ids).size!==ids.length||ids.length<2)fail('Informe pelo menos dois participantes distintos.');
 if(![1,2].includes(legs))fail('Turnos devem ser 1 ou 2.');
 const list=[...ids];if(list.length%2)list.push(null);const rounds=[];
 for(let r=0;r<list.length-1;r++){const pairs=[];for(let i=0;i<list.length/2;i++){const a=list[i],b=list[list.length-1-i];if(a&&b)pairs.push(r%2?[b,a]:[a,b]);}rounds.push(pairs);list.splice(1,0,list.pop());}
 return legs===2?[...rounds,...rounds.map(r=>r.map(([a,b])=>[b,a]))]:rounds;
}
// Classification ordering from the supplied generateClassificationSeeding.
export function seedOrder(size){
 if(size<2||size>256||(size&(size-1)))fail('Chave deve ter de 2 a 256 vagas, em potência de dois.');
 if(size===2)return [1,2];
 const half=size/2,first=[1],last=[];
 for(let seed=4;seed<=half;seed+=2)first.push(seed);
 for(let seed=half-1;seed>=3;seed-=2)last.push(seed);
 last.push(2);
 return [...first,...last].flatMap(seed=>[seed,size+1-seed]);
}

export function standings(ids,matches){
 const rows=new Map(ids.map(id=>[id,{entrant_id:id,played:0,wins:0,draws:0,losses:0,score_for:0,score_against:0,score_diff:0,points:0}]));
 for(const m of matches){if(m.status!=='FINISHED'||m.is_bye||m.score_a==null||m.score_b==null)continue;const a=rows.get(m.entrant_a_id),b=rows.get(m.entrant_b_id);if(!a||!b)continue;
  for(const [r,sc,against] of [[a,m.score_a,m.score_b],[b,m.score_b,m.score_a]]){r.played++;r.score_for+=sc;r.score_against+=against;r.score_diff=r.score_for-r.score_against;if(sc>against){r.wins++;r.points+=3;}else if(sc===against){r.draws++;r.points++;}else r.losses++;}
 }
 return [...rows.values()].sort((a,b)=>b.points-a.points||b.wins-a.wins||b.score_diff-a.score_diff||b.score_for-a.score_for||a.entrant_id.localeCompare(b.entrant_id)).map((r,i)=>({...r,position:i+1}));
}
function addSeries(stage,a,b,extra={}){const series=save('match_series',{id:randomUUID(),local_generator:true,stage_id:stage.id,entrant_a_id:a,entrant_b_id:b,status:'SCHEDULED',best_of:stage.stage_type==='PLAYOFFS'?(stage.best_of_default||1):1,created_at:now(),score_a:null,score_b:null,winner_entrant_id:null,...extra});for(let game=1;game<=series.best_of;game++)save('series_games',{series_id:series.id,game_number:game,status:'SCHEDULED',score_a:null,score_b:null,winner_entrant_id:null,created_at:now()});return series;}
export function createCompetition(user,input){
 const {name,team_ids=[],format='GROUPS',num_groups=2,legs=1}=input;
 if(!name?.trim()||name.length>160)fail('Nome do torneio inválido.');
 if(!['GROUPS','LEAGUE','PLAYOFFS'].includes(format))fail('Formato inválido.');
 if(team_ids.length<2||team_ids.length>256||new Set(team_ids).size!==team_ids.length)fail('Selecione de 2 a 256 equipes distintas.');
 for(const id of team_ids)if(!get('teams',id))fail('Equipe não encontrada.');
 if(format==='GROUPS'&&(!Number.isInteger(num_groups)||num_groups<1||num_groups>Math.floor(team_ids.length/2)))fail('Cada grupo deve ter pelo menos duas equipes.');
 return transaction(()=>{
  const t=save('tournaments',{name:name.trim(),game_id:input.game_id||get('teams',team_ids[0]).game_id,status:'RUNNING',format,created_by_user_id:user.id,created_at:now(),starts_at:now(),scope:'GLOBAL',description:input.description||'',rules_overrides_json:{num_groups,legs,advance_per_group:input.advance_per_group||2},is_easy_mode:false});
  const entrants=team_ids.map((team_id,i)=>save('entrants',{tournament_id:t.id,team_id,seed:i+1,created_at:now()}));
  entrants.forEach(e=>save('registrations',{entrant_id:e.id,tournament_id:t.id,status:'APPROVED',created_at:now()}));
  if(format==='PLAYOFFS')makePlayoffs(t,entrants.map(e=>e.id));else{
   const stage=save('tournament_stages',{tournament_id:t.id,stage_type:format,stage_order:1,best_of_default:legs,result_mode:'SCORE_A_B',standings_mode:'WDL_POINTS',rules_json:{legs},created_at:now()});
   const groups=Array.from({length:format==='LEAGUE'?1:num_groups},(_,i)=>format==='LEAGUE'?{id:null}:save('stage_groups',{stage_id:stage.id,name:'Grupo '+String.fromCharCode(65+i)}));
   const assigned=groups.map(()=>[]);entrants.forEach((e,i)=>{assigned[i%groups.length].push(e.id);if(groups[i%groups.length].id)save('group_entrants',{stage_group_id:groups[i%groups.length].id,group_id:groups[i%groups.length].id,entrant_id:e.id});});
   assigned.forEach((ids,i)=>{roundRobin(ids,legs).forEach((round,r)=>round.forEach(([a,b])=>addSeries(stage,a,b,{group_id:groups[i].id,round_number:r+1})));updateStandings(stage,groups[i].id,ids);});
  }
  log(user,'create_competition','tournaments',t.id);return t;
 });
}
function updateStandings(stage,group,ids){
 const series=where('match_series','stage_id',stage.id).filter(m=>(m.group_id||null)===(group||null)).map(m=>{if(m.score_a!=null)return m;const games=where('series_games','series_id',m.id);return {...m,score_a:games.reduce((s,g)=>s+(g.score_a||0),0),score_b:games.reduce((s,g)=>s+(g.score_b||0),0)};});
 for(const row of standings(ids,series)){const old=where('stage_standings','stage_id',stage.id).find(s=>s.entrant_id===row.entrant_id&&(s.group_id||null)===(group||null));save('stage_standings',{...old,...row,stage_id:stage.id,group_id:group,created_at:old?.created_at||now()});}
}
export function makePlayoffs(t,ids,existingStage=null){
 if(ids.length<2||ids.length>256||new Set(ids).size!==ids.length)fail('São necessários de 2 a 256 classificados distintos.');
 if(!existingStage&&where('tournament_stages','tournament_id',t.id).some(s=>s.stage_type==='PLAYOFFS'))fail('Este torneio já tem playoffs.',409);
 const size=2**Math.ceil(Math.log2(ids.length)),order=seedOrder(size),stages=where('tournament_stages','tournament_id',t.id);
 const stage=existingStage||save('tournament_stages',{tournament_id:t.id,stage_type:'PLAYOFFS',stage_order:stages.length+1,best_of_default:1,result_mode:'SCORE_A_B',rules_json:{},created_at:now()});
 const bracket=save('brackets',{stage_id:stage.id,bracket_type:'SINGLE_ELIM'}),rounds=[];
 for(let r=0,count=size/2;count>=1;r++,count/=2){const round=save('bracket_rounds',{bracket_id:bracket.id,round_number:r+1,name:count===1?'Final':count===2?'Semifinal':count===4?'Quartas de final':count===8?'Oitavas de final':`Rodada ${r+1}`});const matches=[];for(let i=0;i<count;i++){const a=r===0?ids[order[2*i]-1]||null:null,b=r===0?ids[order[2*i+1]-1]||null:null;matches.push(addSeries(stage,a,b,{bracket_round_id:round.id,round_number:r+1,match_index:i,group_id:null}));}rounds.push(matches);}
 for(let r=0;r<rounds.length;r++)rounds[r].forEach((m,i)=>{if(r<rounds.length-1)patch('match_series',m.id,{next_series_id:rounds[r+1][Math.floor(i/2)].id,next_slot:i%2===0?'a':'b'});});
 for(const m of rounds[0])if(!m.entrant_a_id||!m.entrant_b_id){const winner=m.entrant_a_id||m.entrant_b_id;patch('match_series',m.id,{status:'FINISHED',winner_entrant_id:winner,is_bye:true});propagate(get('match_series',m.id),winner);}
 return stage;
}
export function generateExistingStage(user,stageId,input={}){return transaction(()=>{
 const stage=get('tournament_stages',stageId),t=stage&&get('tournaments',stage.tournament_id);if(!t)fail('Fase não encontrada.',404);
 if(user?.role!=='admin'&&t.created_by_user_id!==user?.id)fail('Sem permissão.',403);
 if(where('match_series','stage_id',stageId).length||where('stage_groups','stage_id',stageId).length||where('brackets','stage_id',stageId).length)fail('Esta fase já foi gerada. Os confrontos existentes foram preservados.',409);
 const entrants=where('entrants','tournament_id',t.id).filter(e=>where('registrations','entrant_id',e.id).some(r=>r.status==='APPROVED')).sort((a,b)=>(a.seed||999)-(b.seed||999));
 if(entrants.length<2||entrants.length>256)fail('São necessários de 2 a 256 participantes aprovados.');
 if(stage.stage_type==='PLAYOFFS'){if(![1,2,3,5,7].includes(stage.best_of_default||1))fail('Melhor de inválido.');makePlayoffs(t,entrants.map(e=>e.id),stage);}
 else if(stage.stage_type==='GROUPS'){
  const n=input.num_groups;if(!Number.isInteger(n)||n<1||n>Math.floor(entrants.length/2))fail('Cada grupo precisa de pelo menos dois participantes.');
  const groups=Array.from({length:n},(_,i)=>save('stage_groups',{stage_id:stageId,name:'Grupo '+String.fromCharCode(65+i)}));
  const assigned=groups.map(()=>[]);entrants.forEach((e,i)=>{assigned[i%n].push(e.id);save('group_entrants',{stage_group_id:groups[i%n].id,entrant_id:e.id});});
  assigned.forEach((ids,i)=>{roundRobin(ids,input.legs||1).forEach((r,round)=>r.forEach(([a,b])=>addSeries(stage,a,b,{group_id:groups[i].id,round_number:round+1})));updateStandings(stage,groups[i].id,ids);});
 }else fail('Formato da fase não suportado.');
 log(user,'generate_stage','tournament_stages',stageId);return {success:true,stage_id:stageId};
});}
export function generatePlayoffs(user,tournamentId,input={}){return transaction(()=>{const t=get('tournaments',tournamentId);if(!t)fail('Torneio não encontrado.',404);let ids=input.entrant_ids;
 if(!ids){const stages=where('tournament_stages','tournament_id',t.id).filter(s=>s.stage_type!=='PLAYOFFS');if(!stages.length)ids=where('entrants','tournament_id',t.id).map(e=>e.id);else{
  const last=stages.sort((a,b)=>b.stage_order-a.stage_order)[0],matches=where('match_series','stage_id',last.id);if(matches.some(m=>m.status!=='FINISHED'))fail('Conclua as partidas da fase classificatória antes de gerar os playoffs.',409);
  const rows=where('stage_standings','stage_id',last.id),n=input.advance_per_group||t.rules_overrides_json?.advance_per_group||2;if(!Number.isInteger(n)||n<1)fail('Quantidade de classificados inválida.');
  const groups=[...new Set(rows.map(r=>r.group_id||null))];ids=groups.flatMap(g=>rows.filter(r=>(r.group_id||null)===g).sort((a,b)=>a.position-b.position).slice(0,n).map(r=>r.entrant_id));
 }}
 if(ids.some(id=>get('entrants',id)?.tournament_id!==t.id))fail('Participante não pertence ao torneio.');const stage=makePlayoffs(t,ids);log(user,'generate_playoffs','tournaments',t.id);return stage;});}
function propagate(m,winner){if(m.next_series_id){const next=get('match_series',m.next_series_id);if(next.status==='FINISHED')fail('O confronto seguinte já foi finalizado.',409);patch('match_series',next.id,{['entrant_'+m.next_slot+'_id']:winner});}else{const stage=get('tournament_stages',m.stage_id);if(stage?.stage_type==='PLAYOFFS')patch('tournaments',stage.tournament_id,{status:'FINISHED',champion_entrant_id:winner,ends_at:now()});}}
export function recordResult(user,id,input){
 const {score_a:a,score_b:b,tiebreak_score_a:pa,tiebreak_score_b:pb}=input;
 if(![a,b].every(n=>Number.isInteger(n)&&n>=0&&n<=999))fail('Placar deve conter inteiros de 0 a 999.');
 return transaction(()=>{const m=get('match_series',id);if(!m)fail('Partida não encontrada.',404);if(!m.entrant_a_id||!m.entrant_b_id||m.is_bye)fail('Aguarde os dois participantes.');
  const stage=get('tournament_stages',m.stage_id);let winner=a>b?m.entrant_a_id:b>a?m.entrant_b_id:null;
  if(stage.stage_type==='PLAYOFFS'&&!winner){if(![pa,pb].every(n=>Number.isInteger(n)&&n>=0&&n<=999)||pa===pb)fail('Mata-mata empatado exige desempate.');winner=pa>pb?m.entrant_a_id:m.entrant_b_id;}
  if(m.next_series_id&&get('match_series',m.next_series_id)?.status==='FINISHED')fail('O próximo confronto já foi finalizado; resultado bloqueado.',409);
  const result=patch('match_series',id,{score_a:a,score_b:b,status:'FINISHED',winner_entrant_id:winner});
  const old=where('series_games','series_id',id);if(old.length>1)fail('Use o editor de jogos da série para séries históricas de múltiplas partidas.');
  save('series_games',{...old[0],series_id:id,game_number:1,score_a:a,score_b:b,status:'PLAYED',winner_entrant_id:winner,tiebreak_score_a:pa??null,tiebreak_score_b:pb??null,decided_by:pa!=null?'PENALTIES':'REGULAR',created_at:old[0]?.created_at||now()});
  if(stage.stage_type==='PLAYOFFS')propagate(result,winner);else{const ids=m.group_id?where('group_entrants','stage_group_id',m.group_id).map(e=>e.entrant_id):where('entrants','tournament_id',stage.tournament_id).map(e=>e.id);updateStandings(stage,m.group_id||null,ids);}
  log(user,'record_result','match_series',id);return result;
 });
}
export function transferPlayer(user,playerId,toTeamId,reason='Transferência local',inviteId=null){
 return transaction(()=>{const p=get('player_profiles',playerId),team=toTeamId?get('teams',toTeamId):null;if(!p||toTeamId&&!team)fail('Jogador ou equipe não encontrado.',404);if(team&&p.game_id&&team.game_id!==p.game_id)fail('Jogador e equipe devem ser do mesmo jogo.');const memberships=where('team_players','player_profile_id',playerId);if(memberships.some(m=>m.team_id===toTeamId))fail('Jogador já pertence à equipe.',409);const from=memberships[0]?.team_id||null;
  if(!user)fail('Faça login.',401);if(user.role!=='admin'&&p.user_id!==user.id&&!(toTeamId===null&&memberships.every(m=>get('teams',m.team_id)?.owner_user_id===user.id)))fail('Sem permissão para movimentar este jogador.',403);
  const validation=validateTransfer({player_profile_id:playerId,to_team_id:toTeamId},user);if(!validation.allowed)fail(validation.reason,409);
  for(const m of memberships)dbDelete('team_players',m.id);
  if(team)save('team_players',{team_id:team.id,player_profile_id:playerId,role:'MEMBER',created_at:now()});
  const entry=save('transfer_logs',{player_profile_id:playerId,from_team_id:from,to_team_id:toTeamId||null,action_type:team?'ACCEPT':'LEAVE',reason,performed_by_user_id:user.id,created_at:now()});if(inviteId)patch('team_invites',inviteId,{status:'ACCEPTED',responded_at:now()});log(user,'transfer_player','player_profiles',playerId);return entry;
 });
}
import { remove as dbDelete } from './db.mjs';

// Synchronize series changed through the original score editor. Prebuilt
// local brackets use next_series_id; historical series keep their IDs.
export function syncOriginalSeries(seriesId){
 const m=get('match_series',seriesId),stage=m&&get('tournament_stages',m.stage_id);if(!stage)return;
 // Original UI computes results and advances rounds itself. Only the local
 // generator assigns match_index; don't overwrite the original workflow.
 if(!m.local_generator&&!Number.isInteger(m.match_index))return;
 const games=where('series_games','series_id',seriesId),played=games.filter(g=>g.status==='PLAYED');
 const a=played.reduce((n,g)=>n+Number(g.score_a||0),0),b=played.reduce((n,g)=>n+Number(g.score_b||0),0);
 const winsA=played.filter(g=>g.winner_entrant_id===m.entrant_a_id).length,winsB=played.filter(g=>g.winner_entrant_id===m.entrant_b_id).length,best=m.best_of||1;
 const majority=Math.floor(best/2)+1;
 const finished=best>=3&&best%2===1?(winsA>=majority||winsB>=majority):played.length>=best;
 let winner=null;if(finished){if(best===2)winner=a>b?m.entrant_a_id:b>a?m.entrant_b_id:played.at(-1)?.winner_entrant_id;else winner=winsA>winsB?m.entrant_a_id:winsB>winsA?m.entrant_b_id:null;}
 if(stage.stage_type==='PLAYOFFS'&&finished&&!winner)fail('O mata-mata exige desempate.');
 const result=patch('match_series',seriesId,{score_a:a,score_b:b,status:finished?'FINISHED':'SCHEDULED',winner_entrant_id:winner});
 if(stage.stage_type==='PLAYOFFS'&&finished){if(m.next_series_id||where('bracket_rounds','bracket_id',get('bracket_rounds',m.bracket_round_id)?.bracket_id||'').every(r=>r.round_number<=get('bracket_rounds',m.bracket_round_id)?.round_number))propagate(result,winner);}
 if(stage.stage_type!=='PLAYOFFS'){const ids=m.group_id?where('group_entrants','stage_group_id',m.group_id).map(e=>e.entrant_id):where('entrants','tournament_id',stage.tournament_id).map(e=>e.id);updateStandings(stage,m.group_id||null,ids);}
}
