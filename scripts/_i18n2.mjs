import { readFileSync } from "fs";
const s = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const i = s.indexOf("const notReadyT=");
const chunk = s.slice(i, i+521307);
for (const k of ["\"pt-BR\"","\"pt\"","\"en\"","\"es\"","\"en-US\"","\"es-419\"","code:\"pt","code:\"en","lng:"]) {
  let c=0, p=0, first=-1;
  while ((p=chunk.indexOf(k,p))!==-1) { if(first<0) first=p; c++; p+=k.length; if(c>8) break; }
  console.log(k, c, first);
}
console.log(chunk.slice(510000, 521307));
