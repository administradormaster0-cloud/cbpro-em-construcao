import { readFileSync } from "fs";
const s = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const i = s.indexOf("const notReadyT=");
const chunk = s.slice(i, i+521307);
for (const k of ["addResourceBundle","init(","resources:","lng:","fallbackLng","pt-BR:","\"pt-BR\":","ns:"]) {
  console.log(k, chunk.indexOf(k));
}
const j = chunk.indexOf("lng:");
console.log(chunk.slice(j-100, j+400));
