const fs = require("fs");
const s = fs.readFileSync("D:/FC CLUBS/fcclubs/data/public-js/index-0b7cc5a8.js","utf8");
let p=0, n=0;
while ((p=s.indexOf("ptBR$1",p))!==-1 && n<12) {
  console.log(p, s.slice(Math.max(0,p-70), p+80).replaceAll("\n"," "));
  p += 6; n++;
}
