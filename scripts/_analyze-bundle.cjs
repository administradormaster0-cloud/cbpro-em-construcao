const fs = require("fs");
const s = fs.readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js", "utf8");
const start = s.indexOf("/*! xlsx.js (C) 2013-present SheetJS");
console.log("xlsx start", start, "file", s.length);
const markers = ["jsxRuntimeExports", "XLSX.read", "XLSX.utils", "XLSX.write", "module.exports", "make_xlsx"];
for (const m of markers) {
  let all = 0, before = 0, firstAfter = -1, i = 0;
  while ((i = s.indexOf(m, i)) !== -1) {
    all++;
    if (i < start) before++;
    else if (firstAfter < 0) firstAfter = i;
    i += m.length;
  }
  console.log(m, "total", all, "before", before, "firstAfter", firstAfter);
}
const after = s.slice(start);
const re = /XLSX\.[A-Za-z0-9_]+/g;
const counts = new Map();
let mm;
while ((mm = re.exec(after))) counts.set(mm[0], (counts.get(mm[0]) || 0) + 1);
const top = [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0, 30);
console.log("top XLSX props in lib+after", top);
const beforeStr = s.slice(0, start);
const countsB = new Map();
re.lastIndex = 0;
while ((mm = re.exec(beforeStr))) countsB.set(mm[0], (countsB.get(mm[0]) || 0) + 1);
console.log("XLSX props before lib", [...countsB.entries()]);
console.log("tail 400", s.slice(-400));
