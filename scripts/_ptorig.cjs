const fs = require("fs");
const s = fs.readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
let p=0,n=0;
while ((p=s.indexOf("ptBR$1",p))!==-1 && n<15) {
  console.log(p, s.slice(Math.max(0,p-90), p+100).replaceAll("\n"," "));
  p += 6; n++;
}
console.log("total scan done", n);
