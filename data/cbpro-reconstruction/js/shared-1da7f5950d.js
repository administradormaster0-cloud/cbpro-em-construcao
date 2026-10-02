
const {shimExports,createContextScope,reactExports,jsxRuntimeExports,Primitive,useCallbackRef$1,useLayoutEffect2,cn$1} = globalThis;
function useIsHydrated(){return shimExports.useSyncExternalStore(subscribe,()=>!0,()=>!1)}
function subscribe(){return()=>{}}
var AVATAR_NAME="Avatar",[createAvatarContext,createAvatarScope]=createContextScope(AVATAR_NAME),[AvatarProvider,useAvatarContext]=createAvatarContext(AVATAR_NAME),Avatar$1=reactExports.forwardRef((i,o)=>{const{__scopeAvatar:et,...st}=i,[at,vt]=reactExports.useState("idle");return jsxRuntimeExports.jsx(AvatarProvider,{scope:et,imageLoadingStatus:at,onImageLoadingStatusChange:vt,children:jsxRuntimeExports.jsx(Primitive.span,{...st,ref:o})})});
Avatar$1.displayName=AVATAR_NAME;
var IMAGE_NAME="AvatarImage",AvatarImage$1=reactExports.forwardRef((i,o)=>{const{__scopeAvatar:et,src:st,onLoadingStatusChange:at=()=>{},...vt}=i,Ct=useAvatarContext(IMAGE_NAME,et),Tt=useImageLoadingStatus(st,vt),Lt=useCallbackRef$1($t=>{at($t),Ct.onImageLoadingStatusChange($t)});return useLayoutEffect2(()=>{Tt!=="idle"&&Lt(Tt)},[Tt,Lt]),Tt==="loaded"?jsxRuntimeExports.jsx(Primitive.img,{...vt,ref:o,src:st}):null});
AvatarImage$1.displayName=IMAGE_NAME;
var FALLBACK_NAME="AvatarFallback",AvatarFallback$1=reactExports.forwardRef((i,o)=>{const{__scopeAvatar:et,delayMs:st,...at}=i,vt=useAvatarContext(FALLBACK_NAME,et),[Ct,Tt]=reactExports.useState(st===void 0);return reactExports.useEffect(()=>{if(st!==void 0){const Lt=window.setTimeout(()=>Tt(!0),st);return()=>window.clearTimeout(Lt)}},[st]),Ct&&vt.imageLoadingStatus!=="loaded"?jsxRuntimeExports.jsx(Primitive.span,{...at,ref:o}):null});
AvatarFallback$1.displayName=FALLBACK_NAME;
function resolveLoadingStatus(i,o){return i?o?(i.src!==o&&(i.src=o),i.complete&&i.naturalWidth>0?"loaded":"loading"):"error":"idle"}
function useImageLoadingStatus(i,{referrerPolicy:o,crossOrigin:et}){const st=useIsHydrated(),at=reactExports.useRef(null),vt=st?(at.current||(at.current=new window.Image),at.current):null,[Ct,Tt]=reactExports.useState(()=>resolveLoadingStatus(vt,i));return useLayoutEffect2(()=>{Tt(resolveLoadingStatus(vt,i))},[vt,i]),useLayoutEffect2(()=>{const Lt=Ht=>()=>{Tt(Ht)};if(!vt)return;const $t=Lt("loaded"),qt=Lt("error");return vt.addEventListener("load",$t),vt.addEventListener("error",qt),o&&(vt.referrerPolicy=o),typeof et=="string"&&(vt.crossOrigin=et),()=>{vt.removeEventListener("load",$t),vt.removeEventListener("error",qt)}},[vt,et,o]),Ct}
var Root$5=Avatar$1,Image$1=AvatarImage$1,Fallback=AvatarFallback$1;
const Avatar=reactExports.forwardRef(({className:i,...o},et)=>jsxRuntimeExports.jsx(Root$5,{ref:et,className:cn$1("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",i),...o}));
Avatar.displayName=Root$5.displayName;
const AvatarImage=reactExports.forwardRef(({className:i,...o},et)=>jsxRuntimeExports.jsx(Image$1,{ref:et,className:cn$1("aspect-square h-full w-full",i),...o}));
AvatarImage.displayName=Image$1.displayName;
const AvatarFallback=reactExports.forwardRef(({className:i,...o},et)=>jsxRuntimeExports.jsx(Fallback,{ref:et,className:cn$1("flex h-full w-full items-center justify-center rounded-full bg-muted",i),...o}));
AvatarFallback.displayName=Fallback.displayName;
export {useIsHydrated,subscribe,AVATAR_NAME,createAvatarContext,createAvatarScope,AvatarProvider,useAvatarContext,Avatar$1,IMAGE_NAME,AvatarImage$1,FALLBACK_NAME,AvatarFallback$1,resolveLoadingStatus,useImageLoadingStatus,Root$5,Image$1,Fallback,Avatar,AvatarImage,AvatarFallback};
