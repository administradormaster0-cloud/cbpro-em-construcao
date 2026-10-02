const fs = require("fs");
const s = fs.readFileSync("D:/FC CLUBS/fcclubs/data/public-js/index-0b7cc5a8.js","utf8");
for (const k of ["en$2","es$3"]) {
  let p=0, n=0;
  while ((p=s.indexOf(k,p))!==-1 && n<8) {
    console.log(k, p, s.slice(p-40, p+60).replaceAll("\n"," "));
    p += k.length; n++;
  }
}
