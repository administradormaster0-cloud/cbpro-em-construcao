const fs = require("fs");
const s = fs.readFileSync("D:/FC CLUBS/fcclubs/cloud/frontend.js","utf8");
const i = s.indexOf("const atom=");
console.log(s.slice(i, i+700));
console.log("---RANGE---");
const j = s.indexOf("Content-Range");
console.log(s.slice(j-80, j+220));
