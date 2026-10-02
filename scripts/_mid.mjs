import { readFileSync } from "fs";
const s = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const i = s.indexOf("const notReadyT=");
const chunk = s.slice(i, i+521307);
console.log("len", chunk.length, "end", chunk.slice(-200));
console.log("--- mid ---");
console.log(chunk.slice(250000, 250400));
const keys = ["pt-BR","en:","es:","translation","onnx","xlsx","lucide"];
for (const k of keys) console.log(k, chunk.split(k).length-1);
