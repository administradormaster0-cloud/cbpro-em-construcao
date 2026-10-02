

const {useAuth,jsxRuntimeExports,Navigate} = globalThis;
function AdminRoute({children:i}){const{isAdmin:o,loading:et}=useAuth();return et?null:o?jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment,{children:i}):jsxRuntimeExports.jsx(Navigate,{to:"/dashboard",replace:!0})}
export default AdminRoute;
