import {useQuery} from "./shared-977f829814.js";
const {supabase} = globalThis;
function useLeagueLeaderboard(i){return useQuery({queryKey:["fantasy-leaderboard",i],queryFn:async()=>{const{data:o}=await supabase.from("fantasy_league_members").select("*, users_profile:user_id(id, display_name)").eq("league_id",i).order("total_points",{ascending:!1});return o||[]},enabled:!!i})}
export {useLeagueLeaderboard};
