const fs = require("fs");
const s = fs.readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js", "utf8");
const re = /path:"(\/[^"]*)"/g;
const paths = new Set();
let m;
while ((m = re.exec(s))) paths.add(m[1]);
console.log("paths", paths.size);
console.log([...paths].sort().join("\n"));
