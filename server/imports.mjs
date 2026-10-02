import {all,get,where,save,patch,transaction,log} from './db.mjs';
import {register} from './auth.mjs';
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
const norm=v=>String(v??'').trim().toLowerCase();
const required=(table,id)=>{if(!id||!get(table,id))fail('Referência não encontrada: '+table);return id;};
function unique(rows,label){if(rows.length!==1)fail(rows.length?'Mais de um registro corresponde a '+label:'Registro não encontrado: '+label);return rows[0];}
const account=email=>unique(all('users_profile').filter(u=>norm(u.email)===norm(email)),'e-mail');
const teamByName=(name,game)=>unique(all('teams').filter(t=>norm(t.name)===norm(name)&&(!game||t.game_id===game)),name);
function linkRoster(player,team){if(player.game_id!==team.game_id)fail('Jogador e equipe são de jogos diferentes.');const current=where('team_players','player_profile_id',player.id);if(current.some(r=>r.team_id===team.id))return false;if(current.length)fail('Jogador já tem equipe. Use a transferência para mudar o elenco.');save('team_players',{team_id:team.id,player_profile_id:player.id,role:'MEMBER',created_at:new Date().toISOString()});return true;}
export function importRows(name,p,user){
 if(user?.role!=='admin')fail('Acesso administrativo necessário.',403);
 if(name==='import-users'&&process.env.FC_CLOUD_AUTH==='true')fail('Importação de contas locais desativada. Cadastre usuários pelo Supabase Auth ou pelo formulário de cadastro.',503);
 const keys={'import-users':'users','import-profiles':'profiles','import-teams':'teams','import-team-squads':'squads'};
 const rows=p[keys[name]||'rows'];if(!Array.isArray(rows)||rows.length>1000)fail('Envie no máximo 1.000 linhas por lote.');
 const results=[];
 for(const row of rows){
  const identity={email:row.email,handle:row.handle,team:row.team,conta_vp:row.conta_vp,nome_time:row.nome_time,match_id:row.match_id};
  try{
   if(name==='import-users'){
    if(all('users_profile').some(u=>norm(u.email)===norm(row.email))){results.push({...identity,status:'skipped',message:'Conta já cadastrada.'});continue;}
    const created=register(row.email,row.password,row.display_name);log(user,'import_user','users_profile',created.id);results.push({...identity,status:'created',id:created.id});continue;
   }
   const outcome=transaction(()=>{
    let record,status='created',table;
    if(name==='import-profiles'){
     const u=account(row.email);required('countries',row.country_id);table='users_profile';record=patch(table,u.id,{display_name:String(row.display_name||'').trim(),country_id:row.country_id,...(row.zap_user?{zap_user:String(row.zap_user)}:{})});status='updated';
    }else if(name==='import-teams'){
     const u=account(row.email);required('games',row.game_id);required('countries',row.country_id);if(row.tier_id)required('tiers',row.tier_id);if(!norm(row.name))fail('Nome obrigatório.');
     if(all('teams').some(t=>t.owner_user_id===u.id&&t.game_id===row.game_id&&norm(t.name)===norm(row.name)))return {status:'skipped',message:'Equipe já cadastrada.'};
     table='teams';record=save(table,{owner_user_id:u.id,game_id:row.game_id,country_id:row.country_id,tier_id:row.tier_id||null,name:String(row.name).trim(),tag:row.tag||null,clubsId:row.clubsId||null,created_at:new Date().toISOString()});
    }else if(name==='import-team-squads'){
     const t=teamByName(row.nome_time),player=unique(all('player_profiles').filter(r=>r.game_id===t.game_id&&(norm(r.platform_handle)===norm(row.conta_vp)||norm(r.handle)===norm(row.conta_vp))),row.conta_vp);
     const linked=linkRoster(player,t);log(user,'import_roster','player_profiles',player.id);return {status:linked?'created':'skipped',id:player.id,message:linked?'Vinculado ao elenco.':'Vínculo já existente.'};
    }else if(name==='import-player-profiles'){
     required('users_profile',p.user_id);required('games',p.game_id);required('platforms',p.platform_id);if(!norm(row.handle))fail('ID do jogador obrigatório.');
     const matches=all('player_profiles').filter(r=>r.game_id===p.game_id&&r.platform_id===p.platform_id&&(norm(r.handle)===norm(row.handle)||norm(r.platform_handle)===norm(row.handle)));if(matches.length>1)fail('Jogador ambíguo.');
     const old=matches[0];if(old&&!p.fix_existing)return {status:'skipped',id:old.id,message:'Perfil já existente.'};
     const team=row.team?teamByName(row.team,p.game_id):null;table='player_profiles';
     record=save(table,{...old,user_id:old?.user_id||p.user_id,game_id:p.game_id,platform_id:p.platform_id,handle:String(row.handle).trim(),platform_handle:old?.platform_handle||String(row.handle).trim(),position:row.position||old?.position||null,created_at:old?.created_at||new Date().toISOString()});if(team)linkRoster(record,team);status=old?'updated':'created';
    }else if(name==='import-player-stats'){
     const season=p.season_id?get('ranking_seasons',p.season_id):null;if(p.season_id&&!season)fail('Temporada não encontrada.');
     const player=unique(all('player_profiles').filter(r=>(!season||r.game_id===season.game_id)&&norm(r.handle)===norm(row.handle)),row.handle);
     const counts=['total_matches','total_goals','total_assists','total_mvp'];for(const key of counts)if(!Number.isInteger(Number(row[key]||0))||Number(row[key]||0)<0)fail('Estatística inválida: '+key);
     const rating=Number(row.avg_rating||0);if(!Number.isFinite(rating)||rating<0||rating>10)fail('Nota deve estar entre 0 e 10.');
     table='player_imported_stats';const old=where(table,'player_profile_id',player.id).find(r=>(r.season_id||null)===(p.season_id||null));
     const total=Number(old?.total_matches||0)+Number(row.total_matches||0),changes=Object.fromEntries(counts.map(k=>[k,Number(old?.[k]||0)+Number(row[k]||0)]));
     record=save(table,{...old,...changes,player_profile_id:player.id,season_id:p.season_id||null,avg_rating:total?((Number(old?.avg_rating||0)*Number(old?.total_matches||0)+rating*Number(row.total_matches||0))/total):0,imported_at:new Date().toISOString(),imported_by:user.id});status=old?'updated':'created';
    }else if(name==='import-eafc-matches'){
     const id=Number(row.match_id);if(!Number.isSafeInteger(id)||id<=0)fail('Match ID inválido.');table='eafc_newgen_matches';if(where(table,'match_id',id).length)return {status:'skipped',message:'Partida já importada.'};
     for(const key of ['home_goals','away_goals'])if(row[key]!=null&&(!Number.isInteger(Number(row[key]))||Number(row[key])<0))fail('Placar inválido.');
     record=save(table,{...row,id:undefined,match_id:id,created_at:new Date().toISOString()});
    }else fail('Formato de importação não implementado.',501);
    log(user,'import',table,record.id);return {status,id:record.id,message:status==='updated'?'Atualizado.':'Importado.'};
   });results.push({...identity,...outcome});
  }catch(e){results.push({...identity,status:'error',message:e.message});}
 }
 const summary={total:results.length,created:results.filter(r=>r.status==='created').length,updated:results.filter(r=>r.status==='updated').length,skipped:results.filter(r=>r.status==='skipped').length,errors:results.filter(r=>r.status==='error').length};
 return {success:summary.errors===0,results,summary,inserted:summary.created,skipped:summary.skipped,errors:summary.errors,mapped:summary.created+summary.updated,unmapped:summary.errors,skipped_ids:results.filter(r=>r.status==='skipped').map(r=>r.match_id),error_details:results.filter(r=>r.status==='error').map(r=>r.message)};
}
