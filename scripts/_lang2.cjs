const fs = require("fs");
const s = fs.readFileSync("D:/FC CLUBS/fcclubs/data/public-js/index-0b7cc5a8.js","utf8");
const a = s.indexOf('Permission updated');
console.log("en", a);
console.log(s.slice(a-220, a+40));
const b = s.indexOf("Permiss?o atualizada");
console.log("pt", b);
const c = s.indexOf("Permiso actualizado");
console.log("es", c);
