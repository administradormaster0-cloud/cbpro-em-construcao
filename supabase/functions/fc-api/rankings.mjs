import {clock,stableRandom,isHydration} from './db.mjs';
import {db,all,get} from './db.mjs';
const num=v=>Number.isFinite(Number(v))?Number(v):0;
export const positionCategory=n=>n===1?'GK':n>=2&&n<=6?'DEF':n>=8&&n<=12?'MID':'ATK';
// Formula copied from the public frontend's calcScore$1 function.
export function performanceScore(r){const rating=r.rating_count?r.rating_sum/r.rating_count:0,win=r.matches?r.wins/r.matches*100:0,eff=r.shots?r.goals/r.shots:0;
 switch(positionCategory(r.cod_position)){case 'ATK':return rating*6+r.goals*7+r.assists*4+r.mvp*5+win*3+eff*10+r.wins*2;case 'MID':return rating*6+r.assists*6+r.goals*4+r.passes*.05+r.tackles*2+r.mvp*4+win*3;case 'DEF':return rating*7+r.tackles*4+win*4+r.mvp*5+r.passes*.03;case 'GK':return rating*8+win*5+r.mvp*6+r.passes*.02;}}
const index=t=>new Map(all(t).map(r=>[r.id,r]));
import {requestCache} from './db.mjs';
const cache={has:k=>requestCache().has(k),get:k=>requestCache().get(k),set:(k,v)=>requestCache().set(k,v)};
export function rankingRows(seasonId=null){
 
 const key=seasonId||'all';if(cache.has(key))return cache.get(key);
 const season=seasonId?get('ranking_seasons',seasonId):null;if(seasonId&&!season)return [];
 const profiles=index('player_profiles'),users=index('users_profile'),countries=index('countries'),teams=index('teams'),games=index('series_games'),series=index('match_series'),stages=index('tournament_stages'),tournaments=index('tournaments'),entrants=index('entrants');
 const memberships=new Map();for(const m of all('team_players')){const old=memberships.get(m.player_profile_id);if(!old||String(m.created_at)>String(old.created_at))memberships.set(m.player_profile_id,m);}
 const rows=new Map(),teamRows=new Map();
 const empty=()=>({matches:0,wins:0,draws:0,losses:0,goals:0,assists:0,mvp:0,shots:0,passes:0,tackles:0,rating_sum:0,rating_count:0,trophies:0});
 function ensure(id){if(rows.has(id))return rows.get(id);const p=profiles.get(id);if(!p||season&&p.game_id!==season.game_id)return null;const team=teams.get(memberships.get(id)?.team_id),u=users.get(p.user_id),row={player_profile_id:id,user_id:p.user_id,handle:p.handle,display_name:u?.display_name||p.handle,platform_handle:p.platform_handle,photo_object_key:p.photo_object_key,country_id:p.country_id,country_iso2:countries.get(p.country_id)?.iso2||'',cod_position:p.cod_position,position:p.position,game_id:p.game_id,team_name:team?.name||null,team_emblem_key:team?.emblem_object_key||null,...empty()};rows.set(id,row);return row;}
 const inSeason=(date,gameId)=>!season||gameId===season.game_id&&!!date&&Date.parse(date)>=Date.parse(season.starts_at)&&Date.parse(date)<=Date.parse(season.ends_at);
 const projection=['player_profile_id','internal_match_id','team_id','goals','assists','shots','passes_made','tackles_made','rating','mom','created_at'].map(k=>`json_extract(doc,'$.${k}') AS ${k}`).join(',');
 const stats=db.prepare(`SELECT ${projection},json_extract(doc,'$.raw_player_json.wins') AS wins,json_extract(doc,'$.raw_player_json.losses') AS losses FROM records NOT INDEXED WHERE collection='match_eafc_newgen_player_stats'`).all();
 const seen=new Set();
 for(const s of stats){const p=profiles.get(s.player_profile_id);if(!p)continue;const game=games.get(s.internal_match_id),match=series.get(game?.series_id),tournament=tournaments.get(stages.get(match?.stage_id)?.tournament_id);if(!inSeason(game?.scheduled_at||match?.scheduled_at||s.created_at,tournament?.game_id||p.game_id))continue;
  const identity=s.player_profile_id+':'+s.internal_match_id;if(seen.has(identity))continue;seen.add(identity);const row=ensure(s.player_profile_id);if(!row)continue;
  const teamKey=s.player_profile_id+':'+s.team_id;if(!teamRows.has(teamKey))teamRows.set(teamKey,{player_profile_id:s.player_profile_id,team_id:s.team_id,team_name:teams.get(s.team_id)?.name||null,team_emblem_key:teams.get(s.team_id)?.emblem_object_key||null,...empty()});
  for(const target of [row,teamRows.get(teamKey)]){target.matches++;for(const field of ['goals','assists','shots'])target[field]+=num(s[field]);target.passes+=num(s.passes_made);target.tackles+=num(s.tackles_made);target.mvp+=s.mom===true||s.mom===1||s.mom==='1'?1:0;if(s.rating!==null){target.rating_sum+=num(s.rating);target.rating_count++;}
   if(game&&['PLAYED','FINISHED','COMPLETED'].includes(game.status)&&game.score_a!==null&&game.score_b!==null){const isA=entrants.get(match?.entrant_a_id)?.team_id===s.team_id,isB=entrants.get(match?.entrant_b_id)?.team_id===s.team_id;if(isA||isB){const own=num(isA?game.score_a:game.score_b),opp=num(isA?game.score_b:game.score_a);target[own===opp?'draws':own>opp?'wins':'losses']++;}else{target.wins+=num(s.wins);target.losses+=num(s.losses);}}else{target.wins+=num(s.wins);target.losses+=num(s.losses);}}
 }
 for(const s of all('player_imported_stats')){if(seasonId&&s.season_id!==seasonId)continue;const row=ensure(s.player_profile_id);if(!row)continue;row.matches+=num(s.total_matches);row.goals+=num(s.total_goals);row.assists+=num(s.total_assists);row.mvp+=num(s.total_mvp);row.rating_sum+=num(s.avg_rating)*num(s.total_matches);row.rating_count+=num(s.total_matches);}
 const titleSeen=new Set();function award(player,title,date,game){if(!inSeason(date,game))return;const identity=player+':'+title;if(titleSeen.has(identity))return;titleSeen.add(identity);const row=ensure(player);if(row)row.trophies++;}
 for(const snapshot of all('champion_roster_snapshots')){const t=tournaments.get(snapshot.tournament_id);if(t)award(snapshot.player_profile_id,'tournament:'+t.id,t.ends_at||t.end_date||snapshot.created_at,t.game_id);}
 const titles=index('manual_titles');for(const r of all('manual_title_roster')){const t=titles.get(r.manual_title_id);if(t&&(!seasonId||!t.season_id||t.season_id===seasonId))award(r.player_profile_id,'manual:'+t.id,t.awarded_at,t.game_id);}
 for(const t of titles.values())if(t.player_profile_id)award(t.player_profile_id,'manual:'+t.id,t.awarded_at,t.game_id);
 const result=[...rows.values()].sort((a,b)=>a.player_profile_id.localeCompare(b.player_profile_id));cache.set(key,result);cache.set(key+':teams',[...teamRows.values()]);return result;
}
export function performerCareer(id){const row=rankingRows().find(r=>r.player_profile_id===id);return {career:row?{...row,avg_rating:row.rating_count?row.rating_sum/row.rating_count:0}:null,teams:(cache.get('all:teams')||[]).filter(r=>r.player_profile_id===id).map(r=>({...r,avg_rating:r.rating_count?r.rating_sum/r.rating_count:0}))};}
export function topPerformers(){const best=new Map();for(const r of rankingRows()){if(r.matches<5)continue;const category=positionCategory(r.cod_position),score=performanceScore(r)/r.matches;if(!best.has(category)||best.get(category).score_per_match<score)best.set(category,{...r,pos_category:category,avg_rating:r.rating_count?r.rating_sum/r.rating_count:0,score_per_match:score,plan_key:'free',game_name:get('games',r.game_id)?.name});}return [...best.values()];}
export function playerIcons(p){const rows=rankingRows(p.p_season_id).filter(r=>(!p.p_country_id||r.country_id===p.p_country_id)&&r.matches>=5),result=[];for(const [category,metrics]of Object.entries({ATK:['goals','trophies','assists'],MID:['assists','tackles','trophies'],DEF:['tackles','trophies','mvp'],GK:['trophies','mvp']})){for(const metric of metrics){const candidates=rows.filter(r=>positionCategory(r.cod_position)===category&&r[metric]>0).sort((a,b)=>b[metric]-a[metric]||a.player_profile_id.localeCompare(b.player_profile_id));for(const row of candidates.slice(0,2))result.push({...row,category,metric,value:row[metric]});}}return result;}
