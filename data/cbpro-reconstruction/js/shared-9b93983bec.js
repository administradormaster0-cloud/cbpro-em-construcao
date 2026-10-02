
const {} = globalThis;
function utcDay(i){if(!i)return null;const o=new Date(i);return Number.isNaN(o.getTime())?null:o.toISOString().slice(0,10)}
function isWithinSeason(i,o){const et=utcDay(i),st=utcDay(o.starts_at),at=utcDay(o.ends_at);return!!et&&!!st&&!!at&&st<=et&&et<=at}
function resolveTournamentSeason(i,o){const et=i.ends_at||i.starts_at;if(!et)return null;const st=o.filter(Ct=>isWithinSeason(et,Ct)),at=i.game_id?st.filter(Ct=>Ct.game_id===i.game_id):[],vt=at.length>0?at:st.filter(Ct=>Ct.game_id===null);return vt.length===1?vt[0]:null}
export {utcDay,isWithinSeason,resolveTournamentSeason};
