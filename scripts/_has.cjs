const fs = require("fs");
const s = fs.readFileSync("D:/FC CLUBS/fcclubs/data/hostinger-release/js/index-ef287076.js","utf8");
for (const k of ["function E$2", "var E$2", "E$2=", "function z(", "var z=", "react-dom.production"]) console.log(k, s.includes(k));
