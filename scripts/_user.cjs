const fs = require("fs");
const j = JSON.parse(fs.readFileSync("D:/FC CLUBS/fcclubs/data/configuration-status.json","utf8"));
function walk(o, p) {
  if (!o || typeof o !== "object") return;
  for (const [k,v] of Object.entries(o)) {
    const key = (p+"."+k).toLowerCase();
    if (/user|domain|host|order/.test(key) && (typeof v === "string" || typeof v === "number")) console.log(p+"."+k, "=", v);
    else if (v && typeof v === "object") walk(v, p+"."+k);
  }
}
walk(j, "root");
