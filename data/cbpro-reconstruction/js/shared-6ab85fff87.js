import {toDate} from "./shared-25b6ecd26f.js";
const {} = globalThis;
function differenceInCalendarMonths(i,o){const et=toDate(i),st=toDate(o),at=et.getFullYear()-st.getFullYear(),vt=et.getMonth()-st.getMonth();return at*12+vt}
function endOfMonth(i){const o=toDate(i),et=o.getMonth();return o.setFullYear(o.getFullYear(),et+1,0),o.setHours(23,59,59,999),o}
export {differenceInCalendarMonths,endOfMonth};
