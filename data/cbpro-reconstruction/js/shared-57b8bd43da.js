
const {createContextScope,createDialogScope,jsxRuntimeExports,Root$9,reactExports,Trigger$5,Portal$3,Overlay,createSlottable,useComposedRefs$1,WarningProvider,Content$2,composeEventHandlers,Title,Description,Close,cn$1,buttonVariants} = globalThis;
var ROOT_NAME="AlertDialog",[createAlertDialogContext,createAlertDialogScope]=createContextScope(ROOT_NAME,[createDialogScope]),useDialogScope=createDialogScope(),AlertDialog$1=i=>{const{__scopeAlertDialog:o,...et}=i,st=useDialogScope(o);return jsxRuntimeExports.jsx(Root$9,{...st,...et,modal:!0})};
AlertDialog$1.displayName=ROOT_NAME;
var TRIGGER_NAME$4="AlertDialogTrigger",AlertDialogTrigger$1=reactExports.forwardRef((i,o)=>{const{__scopeAlertDialog:et,...st}=i,at=useDialogScope(et);return jsxRuntimeExports.jsx(Trigger$5,{...at,...st,ref:o})});
AlertDialogTrigger$1.displayName=TRIGGER_NAME$4;
var PORTAL_NAME$1="AlertDialogPortal",AlertDialogPortal$1=i=>{const{__scopeAlertDialog:o,...et}=i,st=useDialogScope(o);return jsxRuntimeExports.jsx(Portal$3,{...st,...et})};
AlertDialogPortal$1.displayName=PORTAL_NAME$1;
var OVERLAY_NAME="AlertDialogOverlay",AlertDialogOverlay$1=reactExports.forwardRef((i,o)=>{const{__scopeAlertDialog:et,...st}=i,at=useDialogScope(et);return jsxRuntimeExports.jsx(Overlay,{...at,...st,ref:o})});
AlertDialogOverlay$1.displayName=OVERLAY_NAME;
var CONTENT_NAME$3="AlertDialogContent",[AlertDialogContentProvider,useAlertDialogContentContext]=createAlertDialogContext(CONTENT_NAME$3),Slottable=createSlottable("AlertDialogContent"),AlertDialogContent$1=reactExports.forwardRef((i,o)=>{const{__scopeAlertDialog:et,children:st,...at}=i,vt=useDialogScope(et),Ct=reactExports.useRef(null),Tt=useComposedRefs$1(o,Ct),Lt=reactExports.useRef(null);return jsxRuntimeExports.jsx(WarningProvider,{contentName:CONTENT_NAME$3,titleName:TITLE_NAME,docsSlug:"alert-dialog",children:jsxRuntimeExports.jsx(AlertDialogContentProvider,{scope:et,cancelRef:Lt,children:jsxRuntimeExports.jsxs(Content$2,{role:"alertdialog",...vt,...at,ref:Tt,onOpenAutoFocus:composeEventHandlers(at.onOpenAutoFocus,$t=>{var qt;$t.preventDefault(),(qt=Lt.current)==null||qt.focus({preventScroll:!0})}),onPointerDownOutside:$t=>$t.preventDefault(),onInteractOutside:$t=>$t.preventDefault(),children:[jsxRuntimeExports.jsx(Slottable,{children:st}),jsxRuntimeExports.jsx(DescriptionWarning,{contentRef:Ct})]})})})});
AlertDialogContent$1.displayName=CONTENT_NAME$3;
var TITLE_NAME="AlertDialogTitle",AlertDialogTitle$1=reactExports.forwardRef((i,o)=>{const{__scopeAlertDialog:et,...st}=i,at=useDialogScope(et);return jsxRuntimeExports.jsx(Title,{...at,...st,ref:o})});
AlertDialogTitle$1.displayName=TITLE_NAME;
var DESCRIPTION_NAME="AlertDialogDescription",AlertDialogDescription$1=reactExports.forwardRef((i,o)=>{const{__scopeAlertDialog:et,...st}=i,at=useDialogScope(et);return jsxRuntimeExports.jsx(Description,{...at,...st,ref:o})});
AlertDialogDescription$1.displayName=DESCRIPTION_NAME;
var ACTION_NAME="AlertDialogAction",AlertDialogAction$1=reactExports.forwardRef((i,o)=>{const{__scopeAlertDialog:et,...st}=i,at=useDialogScope(et);return jsxRuntimeExports.jsx(Close,{...at,...st,ref:o})});
AlertDialogAction$1.displayName=ACTION_NAME;
var CANCEL_NAME="AlertDialogCancel",AlertDialogCancel$1=reactExports.forwardRef((i,o)=>{const{__scopeAlertDialog:et,...st}=i,{cancelRef:at}=useAlertDialogContentContext(CANCEL_NAME,et),vt=useDialogScope(et),Ct=useComposedRefs$1(o,at);return jsxRuntimeExports.jsx(Close,{...vt,...st,ref:Ct})});
AlertDialogCancel$1.displayName=CANCEL_NAME;
var DescriptionWarning=({contentRef:i})=>{const o=`\`${CONTENT_NAME$3}\` requires a description for the component to be accessible for screen reader users.

You can add a description to the \`${CONTENT_NAME$3}\` by passing a \`${DESCRIPTION_NAME}\` component as a child, which also benefits sighted users by adding visible context to the dialog.

Alternatively, you can use your own component as a description by assigning it an \`id\` and passing the same value to the \`aria-describedby\` prop in \`${CONTENT_NAME$3}\`. If the description is confusing or duplicative for sighted users, you can use the \`@radix-ui/react-visually-hidden\` primitive as a wrapper around your description component.

For more information, see https://radix-ui.com/primitives/docs/components/alert-dialog`;return reactExports.useEffect(()=>{var st;document.getElementById((st=i.current)==null?void 0:st.getAttribute("aria-describedby"))||console.warn(o)},[o,i]),null},Root2$3=AlertDialog$1,Trigger2$1=AlertDialogTrigger$1,Portal2=AlertDialogPortal$1,Overlay2=AlertDialogOverlay$1,Content2$2=AlertDialogContent$1,Action=AlertDialogAction$1,Cancel=AlertDialogCancel$1,Title2=AlertDialogTitle$1,Description2=AlertDialogDescription$1;
const AlertDialog=Root2$3,AlertDialogTrigger=Trigger2$1,AlertDialogPortal=Portal2,AlertDialogOverlay=reactExports.forwardRef(({className:i,...o},et)=>jsxRuntimeExports.jsx(Overlay2,{className:cn$1("fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",i),...o,ref:et}));
AlertDialogOverlay.displayName=Overlay2.displayName;
const AlertDialogContent=reactExports.forwardRef(({className:i,...o},et)=>jsxRuntimeExports.jsxs(AlertDialogPortal,{children:[jsxRuntimeExports.jsx(AlertDialogOverlay,{}),jsxRuntimeExports.jsx(Content2$2,{ref:et,className:cn$1("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",i),...o})]}));
AlertDialogContent.displayName=Content2$2.displayName;
const AlertDialogHeader=({className:i,...o})=>jsxRuntimeExports.jsx("div",{className:cn$1("flex flex-col space-y-2 text-center sm:text-left",i),...o});
AlertDialogHeader.displayName="AlertDialogHeader";
const AlertDialogFooter=({className:i,...o})=>jsxRuntimeExports.jsx("div",{className:cn$1("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",i),...o});
AlertDialogFooter.displayName="AlertDialogFooter";
const AlertDialogTitle=reactExports.forwardRef(({className:i,...o},et)=>jsxRuntimeExports.jsx(Title2,{ref:et,className:cn$1("text-lg font-semibold",i),...o}));
AlertDialogTitle.displayName=Title2.displayName;
const AlertDialogDescription=reactExports.forwardRef(({className:i,...o},et)=>jsxRuntimeExports.jsx(Description2,{ref:et,className:cn$1("text-sm text-muted-foreground",i),...o}));
AlertDialogDescription.displayName=Description2.displayName;
const AlertDialogAction=reactExports.forwardRef(({className:i,...o},et)=>jsxRuntimeExports.jsx(Action,{ref:et,className:cn$1(buttonVariants(),i),...o}));
AlertDialogAction.displayName=Action.displayName;
const AlertDialogCancel=reactExports.forwardRef(({className:i,...o},et)=>jsxRuntimeExports.jsx(Cancel,{ref:et,className:cn$1(buttonVariants({variant:"outline"}),"mt-2 sm:mt-0",i),...o}));
AlertDialogCancel.displayName=Cancel.displayName;
export {ROOT_NAME,createAlertDialogContext,createAlertDialogScope,useDialogScope,AlertDialog$1,TRIGGER_NAME$4,AlertDialogTrigger$1,PORTAL_NAME$1,AlertDialogPortal$1,OVERLAY_NAME,AlertDialogOverlay$1,CONTENT_NAME$3,AlertDialogContentProvider,useAlertDialogContentContext,Slottable,AlertDialogContent$1,TITLE_NAME,AlertDialogTitle$1,DESCRIPTION_NAME,AlertDialogDescription$1,ACTION_NAME,AlertDialogAction$1,CANCEL_NAME,AlertDialogCancel$1,DescriptionWarning,Root2$3,Trigger2$1,Portal2,Overlay2,Content2$2,Action,Cancel,Title2,Description2,AlertDialog,AlertDialogTrigger,AlertDialogPortal,AlertDialogOverlay,AlertDialogContent,AlertDialogHeader,AlertDialogFooter,AlertDialogTitle,AlertDialogDescription,AlertDialogAction,AlertDialogCancel};
