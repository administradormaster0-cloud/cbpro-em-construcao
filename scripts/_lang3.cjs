const fs = require("fs");
const s = fs.readFileSync("D:/FC CLUBS/fcclubs/data/public-js/index-0b7cc5a8.js","utf8");
const a = s.indexOf("Permission updated");
console.log(s.slice(a-600, a-200));
