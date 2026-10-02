const fs = require("fs");
const s = fs.readFileSync("D:/FC CLUBS/fcclubs/data/public-js/index-0b7cc5a8.js","utf8");
let p = 0, n = 0;
while ((p = s.indexOf("clubId.freeAllowance", p)) !== -1 && n < 5) {
  console.log("\n#", n, p);
  console.log(s.slice(p, p+120));
  console.log("---before---");
  console.log(s.slice(Math.max(0,p-80), p));
  p += 10; n++;
}
