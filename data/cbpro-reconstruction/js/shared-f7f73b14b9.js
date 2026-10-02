
const {instance} = globalThis;
function getScheduleInfo(i){var Ct;const o=(Ct=i==null?void 0:i.rules_overrides_json)==null?void 0:Ct.schedule;if(!o)return null;const et=o.days_of_week,st=o.time_slots;if(!(et!=null&&et.length)&&!(st!=null&&st.length))return null;const at=et!=null&&et.length?et.map(Tt=>instance.t(`days.${Tt}`)).join(", "):"",vt=st!=null&&st.length?st.map(Tt=>Tt.time||Tt).join(", "):"";return{days:at,times:vt}}
export {getScheduleInfo};
