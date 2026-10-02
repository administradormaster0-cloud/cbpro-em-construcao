const fs = require("fs");
const s = fs.readFileSync("D:/FC CLUBS/fcclubs/data/public-js/index-0b7cc5a8.js","utf8");
const i = s.indexOf("supportedLanguages=");
console.log("supported", i);
console.log(s.slice(i-500, i+400));
