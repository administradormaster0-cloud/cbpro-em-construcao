
const {supabase} = globalThis;
async function linkEaClub(i){const{data:o,error:et}=await supabase.rpc("fn_change_team_club_id",{p_team_id:i.teamId,p_new_club_id:i.clubId,p_new_club_name:i.clubName,p_new_platform:i.platform||null,p_new_members:i.members||[],p_request_id:i.requestId||crypto.randomUUID()});if(et)throw et;return o}
export {linkEaClub};
