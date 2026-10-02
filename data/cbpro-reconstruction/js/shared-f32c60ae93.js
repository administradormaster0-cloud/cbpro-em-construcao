
const {supabase} = globalThis;
let cachedFlags=null,cachePromise=null;
async function fetchFlags(){const{data:i}=await supabase.from("site_feature_flags").select("feature_key, feature_label, feature_group, entity_type, visible");return i||[]}
function getFlags(){return cachedFlags?Promise.resolve(cachedFlags):(cachePromise||(cachePromise=fetchFlags().then(i=>(cachedFlags=i,i))),cachePromise)}
function invalidateFeatureFlags(){cachedFlags=null,cachePromise=null}
export {cachedFlags,cachePromise,fetchFlags,getFlags,invalidateFeatureFlags};
