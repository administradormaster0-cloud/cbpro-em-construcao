
const {reactExports,supabase,instance} = globalThis;
let cachedPositions=null;
function usePositions(){const[i,o]=reactExports.useState(cachedPositions||[]),[et,st]=reactExports.useState(!cachedPositions);return reactExports.useEffect(()=>{cachedPositions||(async()=>{const{data:at}=await supabase.from("eafc_newgen_player_positions").select("position_id, code_ptbr, code_en, code_es, label_ptbr, label_en, label_es").order("position_id");at&&(cachedPositions=at,o(cachedPositions)),st(!1)})()},[]),{positions:i,loading:et}}
function getPositionCode(i){if(!i)return"";const o=instance.language;return o==="es"?i.code_es||i.code_ptbr:o==="en"&&i.code_en||i.code_ptbr}
export {cachedPositions,usePositions,getPositionCode};
