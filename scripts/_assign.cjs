const fs = require("fs");
const zlib = require("zlib");
const s = fs.readFileSync("D:/FC CLUBS/fcclubs/data/public-js/index-0b7cc5a8.js","utf8");
const a = s.indexOf("Object.assign(globalThis");
const b = s.indexOf(");", a);
console.log("assign bytes", b-a+2);
const cut = s.slice(0,a)+s.slice(b+2);
console.log("gz full", zlib.gzipSync(s).length, "gz no assign", zlib.gzipSync(cut).length);
