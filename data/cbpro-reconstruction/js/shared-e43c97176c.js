
const {reactExports} = globalThis;
function useDebouncedValue(i,o=300){const[et,st]=reactExports.useState(i);return reactExports.useEffect(()=>{const at=setTimeout(()=>st(i),o);return()=>clearTimeout(at)},[i,o]),et}
export {useDebouncedValue};
