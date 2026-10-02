
const {cva,jsxRuntimeExports,cn$1} = globalThis;
const badgeVariants=cva("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",{variants:{variant:{default:"border-primary/30 bg-primary/15 text-primary shadow-[0_0_6px_hsl(var(--primary)/0.1)]",secondary:"border-transparent bg-secondary text-secondary-foreground",destructive:"border-destructive/30 bg-destructive/15 text-destructive",outline:"text-foreground border-border/60",success:"border-transparent bg-[hsl(var(--success)/.15)] text-[hsl(var(--success))]",warning:"border-transparent bg-[hsl(var(--warning)/.15)] text-[hsl(var(--warning))]"}},defaultVariants:{variant:"default"}});
function Badge({className:i,variant:o,...et}){return jsxRuntimeExports.jsx("div",{className:cn$1(badgeVariants({variant:o}),i),...et})}
export {badgeVariants,Badge};
