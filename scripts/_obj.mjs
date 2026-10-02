import { readFileSync } from "fs";
const s = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const i = s.indexOf("const notReadyT=");
const first = s.indexOf("adminSectionPerms.updated", i);
console.log(s.slice(first-500, first));
