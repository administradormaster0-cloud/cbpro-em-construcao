import { readFileSync } from "fs";
const s = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const i = s.indexOf("const notReadyT=");
const chunk = s.slice(i, i+521307);
const re = /(?:^|[,{])\s*(pt-BR|pt|en|es|en-US|es-ES|fr|de)\s*:/g;
const counts = {};
let m; const pos=[];
while ((m=re.exec(chunk))) { counts[m[1]]=(counts[m[1]]||0)+1; if(pos.length<20) pos.push(m[1]+"@"+m.index); }
console.log(counts);
console.log(pos);
const markers = ["resources=","resources:","supportedLanguages","translation:{"];
for (const k of markers) console.log(k, chunk.indexOf(k));
