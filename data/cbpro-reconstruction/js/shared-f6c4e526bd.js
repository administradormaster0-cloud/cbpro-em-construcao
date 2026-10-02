
const {reactExports,RouteContext} = globalThis;
function useParams(){let{matches:i}=reactExports.useContext(RouteContext),o=i[i.length-1];return o?o.params:{}}
export {useParams};
