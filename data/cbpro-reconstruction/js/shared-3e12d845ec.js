
const {reactExports,useLocation,useNavigate} = globalThis;
function createSearchParams(i){return i===void 0&&(i=""),new URLSearchParams(typeof i=="string"||Array.isArray(i)||i instanceof URLSearchParams?i:Object.keys(i).reduce((o,et)=>{let st=i[et];return o.concat(Array.isArray(st)?st.map(at=>[et,at]):[[et,st]])},[]))}
function getSearchParamsForLocation(i,o){let et=createSearchParams(i);return o&&o.forEach((st,at)=>{et.has(at)||o.getAll(at).forEach(vt=>{et.append(at,vt)})}),et}
function useSearchParams(i){let o=reactExports.useRef(createSearchParams(i)),et=reactExports.useRef(!1),st=useLocation(),at=reactExports.useMemo(()=>getSearchParamsForLocation(st.search,et.current?null:o.current),[st.search]),vt=useNavigate(),Ct=reactExports.useCallback((Tt,Lt)=>{const $t=createSearchParams(typeof Tt=="function"?Tt(at):Tt);et.current=!0,vt("?"+$t,Lt)},[vt,at]);return[at,Ct]}
export {createSearchParams,getSearchParamsForLocation,useSearchParams};
