import { readFileSync } from "fs";
const s = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const i = s.indexOf("const notReadyT=");
console.log("notReady at", i);
console.log(s.slice(i, i+400));
console.log("--- langs ---");
for (const k of ["pt-BR","en-US","es-ES","resources:"]) {
  let c=0, p=i, n=0;
  while ((p=s.indexOf(k, p))!==-1 && p<i+530000 && n<3) { console.log(k, p-i); p+=k.length; n++; }
}
const j = s.indexOf("var fc,Ua=");
console.log("\nFC HEAD", s.slice(j, j+250));
const k = s.indexOf("var ft,Ss$1=");
console.log("\nFT HEAD", s.slice(k, k+250));
