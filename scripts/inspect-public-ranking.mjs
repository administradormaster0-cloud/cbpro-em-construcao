import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
const bundle=readFileSync('../site/js/index-CL0UsMlE.rw7div.js','utf8');
const key=bundle.match(/sb_publishable_[A-Za-z0-9_-]+/)[0];
const dir='../reverse_engineering/public-ranking';mkdirSync(dir,{recursive:true});
for(const [name,p]of [['fn_top_performers_highlight',{}],['fn_rnk_player_season_rows',{p_season_id:null}],['fn_season_pro_players_icons',{p_season_id:null}]]){
 const r=await fetch('https://pkoysigjsorpefekkiqf.supabase.co/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify(p),signal:AbortSignal.timeout(30000)});
 const data=await r.json();if(!r.ok){console.log(name,'HTTP',r.status);continue;}writeFileSync(dir+'/'+name+'.json',JSON.stringify(data,null,2));console.log(name,Array.isArray(data)?data.length:'object',JSON.stringify(Array.isArray(data)?data[0]:data));
}
const highlights=JSON.parse(readFileSync(dir+(existsSync(dir+'/fn_top_performers_highlight.json')?'/fn_top_performers_highlight.json':'/fn_rnk_player_season_rows.json'),'utf8'));
if(highlights[0]){const r=await fetch('https://pkoysigjsorpefekkiqf.supabase.co/rest/v1/rpc/fn_top_performer_career',{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({p_player_profile_id:highlights[0].player_profile_id}),signal:AbortSignal.timeout(30000)});if(r.ok){const data=await r.json();writeFileSync(dir+'/fn_top_performer_career.json',JSON.stringify(data,null,2));console.log('career',JSON.stringify(data).slice(0,3500));}}
