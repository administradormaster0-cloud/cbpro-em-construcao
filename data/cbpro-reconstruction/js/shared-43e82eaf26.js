
const {createContextScope,reactExports,jsxRuntimeExports,Primitive,cn$1} = globalThis;
var PROGRESS_NAME="Progress",DEFAULT_MAX=100,[createProgressContext,createProgressScope]=createContextScope(PROGRESS_NAME),[ProgressProvider,useProgressContext]=createProgressContext(PROGRESS_NAME),Progress$1=reactExports.forwardRef((i,o)=>{const{__scopeProgress:et,value:st=null,max:at,getValueLabel:vt=defaultGetValueLabel,...Ct}=i;(at||at===0)&&!isValidMaxNumber(at)&&console.error(getInvalidMaxError(`${at}`,"Progress"));const Tt=isValidMaxNumber(at)?at:DEFAULT_MAX;st!==null&&!isValidValueNumber(st,Tt)&&console.error(getInvalidValueError(`${st}`,"Progress"));const Lt=isValidValueNumber(st,Tt)?st:null,$t=isNumber$4(Lt)?vt(Lt,Tt):void 0;return jsxRuntimeExports.jsx(ProgressProvider,{scope:et,value:Lt,max:Tt,children:jsxRuntimeExports.jsx(Primitive.div,{"aria-valuemax":Tt,"aria-valuemin":0,"aria-valuenow":isNumber$4(Lt)?Lt:void 0,"aria-valuetext":$t,role:"progressbar","data-state":getProgressState(Lt,Tt),"data-value":Lt??void 0,"data-max":Tt,...Ct,ref:o})})});
Progress$1.displayName=PROGRESS_NAME;
var INDICATOR_NAME$2="ProgressIndicator",ProgressIndicator=reactExports.forwardRef((i,o)=>{const{__scopeProgress:et,...st}=i,at=useProgressContext(INDICATOR_NAME$2,et);return jsxRuntimeExports.jsx(Primitive.div,{"data-state":getProgressState(at.value,at.max),"data-value":at.value??void 0,"data-max":at.max,...st,ref:o})});
ProgressIndicator.displayName=INDICATOR_NAME$2;
function defaultGetValueLabel(i,o){return`${Math.round(i/o*100)}%`}
function getProgressState(i,o){return i==null?"indeterminate":i===o?"complete":"loading"}
function isNumber$4(i){return typeof i=="number"}
function isValidMaxNumber(i){return isNumber$4(i)&&!isNaN(i)&&i>0}
function isValidValueNumber(i,o){return isNumber$4(i)&&!isNaN(i)&&i<=o&&i>=0}
function getInvalidMaxError(i,o){return`Invalid prop \`max\` of value \`${i}\` supplied to \`${o}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${DEFAULT_MAX}\`.`}
function getInvalidValueError(i,o){return`Invalid prop \`value\` of value \`${i}\` supplied to \`${o}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${DEFAULT_MAX} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`}
var Root$3=Progress$1,Indicator$1=ProgressIndicator;
const Progress=reactExports.forwardRef(({className:i,value:o,...et},st)=>jsxRuntimeExports.jsx(Root$3,{ref:st,className:cn$1("relative h-4 w-full overflow-hidden rounded-full bg-secondary",i),...et,children:jsxRuntimeExports.jsx(Indicator$1,{className:"h-full w-full flex-1 bg-primary transition-all",style:{transform:`translateX(-${100-(o||0)}%)`}})}));
Progress.displayName=Root$3.displayName;
export {PROGRESS_NAME,DEFAULT_MAX,createProgressContext,createProgressScope,ProgressProvider,useProgressContext,Progress$1,INDICATOR_NAME$2,ProgressIndicator,defaultGetValueLabel,getProgressState,isNumber$4,isValidMaxNumber,isValidValueNumber,getInvalidMaxError,getInvalidValueError,Root$3,Indicator$1,Progress};
