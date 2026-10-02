import { readFileSync } from "fs";
import { gzipSync } from "zlib";
const s = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
console.log("full gz", gzipSync(s).length, "raw", s.length);
const x0 = s.indexOf("/*! xlsx.js");
const x1 = s.indexOf("jsxRuntimeExports", x0);
console.log("xlsx", x0, x1, "span", x1-x0);
let cut = s.slice(0,x0)+s.slice(x1);
console.log("without xlsx gz", gzipSync(cut).length, "raw", cut.length);
let idx=0, n=0;
while ((idx = cut.indexOf("ONNX Runtime", idx))!==-1 && n<6) { console.log("onnx at", idx); idx+=10; n++; }
