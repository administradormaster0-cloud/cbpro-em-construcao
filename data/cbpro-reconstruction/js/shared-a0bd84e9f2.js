
const {supabase} = globalThis;
function getClientLanguage(){return typeof navigator>"u"?"en":(navigator.language||"en").slice(0,12)}
async function getOrCreateConversation(i,o){const[et,st]=[i,o].sort(),{data:at}=await supabase.from("direct_conversations").select("*").eq("user1_id",et).eq("user2_id",st).maybeSingle();if(at)return at;const{data:vt,error:Ct}=await supabase.from("direct_conversations").insert({user1_id:et,user2_id:st}).select().single();if(Ct)throw Ct;return vt}
async function sendMessage(i,o,et,st="text",at,vt,Ct){const Tt={conversation_id:i,sender_id:o,message:et,message_type:st};st==="text"&&(Tt.language_original=getClientLanguage()),Ct&&(Tt.metadata=Ct);const{data:Lt,error:$t}=await supabase.from("direct_messages").insert(Tt).select().single();if($t)throw $t;return Lt}
export {getClientLanguage,getOrCreateConversation,sendMessage};
