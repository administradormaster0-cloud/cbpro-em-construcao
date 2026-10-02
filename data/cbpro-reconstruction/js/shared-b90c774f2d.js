
const {reactExports} = globalThis;
const MOBILE_BREAKPOINT=768;
function useIsMobile$6(){const[i,o]=reactExports.useState(void 0);return reactExports.useEffect(()=>{const et=window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT-1}px)`),st=()=>{o(window.innerWidth<MOBILE_BREAKPOINT)};return et.addEventListener("change",st),o(window.innerWidth<MOBILE_BREAKPOINT),()=>et.removeEventListener("change",st)},[]),!!i}
export {MOBILE_BREAKPOINT,useIsMobile$6};
