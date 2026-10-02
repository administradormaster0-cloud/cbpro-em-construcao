

const {useAuth,jsxRuntimeExports,Navigate} = globalThis;
function ProtectedRoute({children:i}){const{user:o,loading:et,profile:st,profileLoading:at}=useAuth();return et||at?jsxRuntimeExports.jsx("div",{className:"min-h-screen flex items-center justify-center bg-background",children:jsxRuntimeExports.jsx("div",{className:"text-muted-foreground",children:"Loading..."})}):o?st?jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment,{children:i}):jsxRuntimeExports.jsx(Navigate,{to:"/onboarding",replace:!0}):jsxRuntimeExports.jsx(Navigate,{to:"/login",replace:!0})}
export default ProtectedRoute;
