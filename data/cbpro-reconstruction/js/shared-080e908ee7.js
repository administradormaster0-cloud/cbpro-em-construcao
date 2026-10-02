import {SUPABASE_URL$8,BUCKET$1,DEFAULT_PLAYER_PHOTO$1} from "./shared-cd99e4f876.js";
const {} = globalThis;
function playerPhotoUrl(i){return i?i.startsWith("http")?i:`${SUPABASE_URL$8}/storage/v1/object/public/${BUCKET$1}/${i}`:DEFAULT_PLAYER_PHOTO$1}
export {playerPhotoUrl};
