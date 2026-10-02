import { readFileSync } from "fs";
const s = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
let i=0,n=0;
while ((i=s.indexOf("createRoot(", i))!==-1 && n<8) {
  console.log(i, s.slice(i, i+180).replaceAll("\n"," "));
  i+=10; n++;
}
console.log("--- end 500 ---");
console.log(s.slice(-500));
