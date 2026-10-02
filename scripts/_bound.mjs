import { readFileSync } from "fs";
const s = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const i = s.indexOf("const notReadyT=");
for (const off of [78839, 250025, 421049]) {
  const at = i+off;
  console.log("\nOFF", off);
  console.log(s.slice(at-120, at+40));
}
