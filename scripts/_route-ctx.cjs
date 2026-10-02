const fs = require("fs");
const s = fs.readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js", "utf8");
const needle = 'path:"/"';
let idx = 0, n = 0;
while ((idx = s.indexOf(needle, idx)) !== -1 && n < 8) {
  console.log("\n-----", idx, "-----\n");
  console.log(s.slice(Math.max(0, idx - 180), idx + 420));
  idx += needle.length;
  n++;
}
