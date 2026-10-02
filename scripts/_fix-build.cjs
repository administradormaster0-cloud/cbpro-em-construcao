const fs = require("fs");
const p = "D:/FC CLUBS/fcclubs/scripts/build-hostinger.mjs";
let s = fs.readFileSync(p, "utf8");
if (!s.includes("readdirSync")) s = s.replace("import {readFileSync,writeFileSync,readdirSync,mkdirSync,copyFileSync,statSync}", "import {readFileSync,writeFileSync,readdirSync,mkdirSync,copyFileSync,statSync}");
s = s.replace("const entry=require('fs').readdirSync('data/public-js')", "const entry=readdirSync('data/public-js')");
fs.writeFileSync(p, s);
console.log(s.includes("require(") ? "still has require" : "require gone");
