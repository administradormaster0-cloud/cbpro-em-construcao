import { readFileSync } from "fs";
const s = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const i = s.indexOf("const notReadyT=");
console.log("notReady at", i);
console.log(s.slice(i, i+500));
const j = s.indexOf("var fc,Ua=");
console.log("FC HEAD", j, s.slice(j, j+300));
const k = s.indexOf("var ft,Ss$1=");
console.log("FT HEAD", k, s.slice(k, k+300));
