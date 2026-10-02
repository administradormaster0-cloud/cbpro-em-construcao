
const {reactExports,jsxRuntimeExports,Primitive,cva,cn$1} = globalThis;
var NAME="Label",Label$3=reactExports.forwardRef((i,o)=>jsxRuntimeExports.jsx(Primitive.label,{...i,ref:o,onMouseDown:et=>{var at;et.target.closest("button, input, select, textarea")||((at=i.onMouseDown)==null||at.call(i,et),!et.defaultPrevented&&et.detail>1&&et.preventDefault())}}));
Label$3.displayName=NAME;
var Root$7=Label$3;
const labelVariants=cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"),Label$2=reactExports.forwardRef(({className:i,...o},et)=>jsxRuntimeExports.jsx(Root$7,{ref:et,className:cn$1(labelVariants(),i),...o}));
Label$2.displayName=Root$7.displayName;
export {NAME,Label$3,Root$7,labelVariants,Label$2};
