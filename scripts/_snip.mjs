import { readFileSync, writeFileSync } from "fs";
const source = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js", "utf8");
const at = source.indexOf("BrowserRouter,{children:");
writeFileSync("D:/FC CLUBS/fcclubs/scripts/_root-snippet.txt", source.slice(at - 200, at + 6000));
console.log("at", at, "len", source.length);
