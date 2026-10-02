
const {supabase} = globalThis;
async function fetchFriendlyConfig(){const{data:i}=await supabase.from("friendly_config").select("*").limit(1).maybeSingle();return i}
export {fetchFriendlyConfig};
