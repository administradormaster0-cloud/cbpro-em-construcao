const fs = require("fs");
const s = fs.readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js", "utf8");
const names = ["Index","PlayerPublic","TeamPublic","TournamentsPublic","AdminPanel","Xls","readXls","parseXls"];
for (const n of names) {
  const a = s.indexOf("function "+n+"(");
  const b = s.indexOf("const "+n+"=");
  const c = s.indexOf(","+n+"=");
  console.log(n, "function", a, "const", b, "comma", c);
}
// component identifiers used in Route elements
const re = /element:jsxRuntimeExports\.jsx\(([A-Za-z0-9_$]+),/g;
const comps = new Map();
let m;
while ((m = re.exec(s))) comps.set(m[1], (comps.get(m[1])||0)+1);
console.log("route components", [...comps.keys()].join(", "));
