
const {useAuth,reactExports} = globalThis;
function resolveCountryFilterValue(i,o,et,st="all"){return o===null?i===st?et:i:i===o?et:i}
function useCountryDefaultFilter(i,o,et="all",st=!0){const{user:at,countryContextId:vt,countryContextLoading:Ct}=useAuth(),Tt=reactExports.useRef(null);return reactExports.useEffect(()=>{if(!st){Tt.current=null;return}if(Ct)return;const Lt=at&&vt||et,$t=resolveCountryFilterValue(i,Tt.current,Lt,et);$t!==i&&o($t),Tt.current=Lt},[at,vt,Ct,et,i,o,st]),st&&at&&!Ct&&vt||et}
export {resolveCountryFilterValue,useCountryDefaultFilter};
