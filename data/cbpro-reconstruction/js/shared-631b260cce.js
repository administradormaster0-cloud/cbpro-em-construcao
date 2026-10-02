import {shouldThrowError} from "./shared-977f829814.js";
const {useQueryClient,reactExports,MutationObserver$1,notifyManager,noop$7} = globalThis;
function useMutation(i,o){const et=useQueryClient(),[st]=reactExports.useState(()=>new MutationObserver$1(et,i));reactExports.useEffect(()=>{st.setOptions(i)},[st,i]);const at=reactExports.useSyncExternalStore(reactExports.useCallback(Ct=>st.subscribe(notifyManager.batchCalls(Ct)),[st]),()=>st.getCurrentResult(),()=>st.getCurrentResult()),vt=reactExports.useCallback((Ct,Tt)=>{st.mutate(Ct,Tt).catch(noop$7)},[st]);if(at.error&&shouldThrowError(st.options.throwOnError,[at.error]))throw at.error;return{...at,mutate:vt,mutateAsync:at.mutate}}
export {useMutation};
