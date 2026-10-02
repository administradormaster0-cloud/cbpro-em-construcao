const fs = require("fs");
const j = JSON.parse(fs.readFileSync("D:/FC CLUBS/fcclubs/data/configuration-status.json","utf8"));
console.log(Object.keys(j));
console.log(JSON.stringify(j).slice(0, 800));
