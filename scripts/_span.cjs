const fs = require("fs");
const s = fs.readFileSync("D:/FC CLUBS/fcclubs/data/public-js/index-0b7cc5a8.js","utf8");
const k = "ENCONTRE SEU CLUBE";
let p=0,n=0; while((p=s.indexOf(k,p))!==-1){ n++; console.log(p); p+=k.length; }
console.log("count", n);
const a = s.indexOf("ptBR$1=");
const b = s.indexOf(",supportedLanguages=");
console.log("dict span", a, b, b-a);
