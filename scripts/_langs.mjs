import { readFileSync } from "fs";
const s = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const i = s.indexOf("const notReadyT=");
const end = i+521307;
const key = "adminSectionPerms.updated";
let p=i;
while ((p=s.indexOf(key, p))!==-1 && p<end) {
  console.log("at", p-i, s.slice(p, p+80));
  p+=key.length;
}
console.log("--- nearby structure before first ---");
const first = s.indexOf(key, i);
console.log(s.slice(first-200, first+40));
