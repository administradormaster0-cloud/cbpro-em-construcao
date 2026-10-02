
const {supabase} = globalThis;
const TIER_PRIORITY$2={free:0,pro:1,ultra:2};
async function resolvePlayerIds$1(i){if(i.length===0)return{allSearchIds:[],reverseMap:{}};const o={},et=new Set;i.forEach(vt=>{et.add(vt),o[vt]=vt});const{data:st}=await supabase.from("player_profiles").select("id, user_id").in("user_id",i);(st||[]).forEach(vt=>{et.add(vt.id),o[vt.id]=vt.user_id});const{data:at}=await supabase.from("player_profiles").select("id, user_id").in("id",i);return(at||[]).forEach(vt=>{et.add(vt.user_id),o[vt.user_id]=vt.id,o[vt.id]=vt.id}),{allSearchIds:[...et],reverseMap:o}}
export {TIER_PRIORITY$2,resolvePlayerIds$1};
