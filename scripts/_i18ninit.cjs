const fs = require("fs");
const s = fs.readFileSync("D:/FC CLUBS/fcclubs/data/public-js/index-0b7cc5a8.js","utf8");
console.log("init in entry", s.includes("initReactI18next"));
const o = fs.readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const i = o.indexOf("instance.use(initReactI18next)");
console.log(o.slice(i-120, i+700));
