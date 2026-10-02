

const {useAuth,jsxRuntimeExports,Navigate} = globalThis;
function AuthRoute({children:i}){const{user:o,loading:et}=useAuth();return et?null:o?jsxRuntimeExports.jsx(Navigate,{to:"/dashboard",replace:!0}):jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment,{children:i})}
export default AuthRoute;
