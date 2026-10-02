import {PLAN_CONFIG} from "./shared-acf79226ff.js";
const {Sparkles,Crown,jsxRuntimeExports,cn$1} = globalThis;
const planStyles={free:{bg:"bg-muted/40",text:"text-muted-foreground",border:"border-border/40",icon:null},pro:{bg:"bg-primary/10",text:"text-primary",border:"border-primary/30",icon:Sparkles},ultra:{bg:"bg-[hsl(45,100%,50%)]/10",text:"text-[hsl(45,100%,50%)]",border:"border-[hsl(45,100%,50%)]/30",icon:Crown}};
function PlanBadge({plan:i,className:o,size:et="sm"}){const st=planStyles[i],at=PLAN_CONFIG[i],vt=st.icon;return jsxRuntimeExports.jsxs("div",{className:cn$1("inline-flex items-center gap-1 rounded-md border font-bold uppercase tracking-wider",st.bg,st.text,st.border,et==="sm"?"px-2 py-0.5 text-[10px]":"px-2.5 py-1 text-xs",o),children:[vt&&jsxRuntimeExports.jsx(vt,{className:et==="sm"?"h-3 w-3":"h-3.5 w-3.5"}),jsxRuntimeExports.jsx("span",{children:at.name})]})}
export {planStyles,PlanBadge};
