const fs = require("fs");
let s = fs.readFileSync("D:/FC CLUBS/fcclubs/cloud/frontend.js","utf8");
s = s.replace("async function readPublic(url,method){", "async function readPublic(url,method,headers){");
s = s.replace('const single=(q.get("accept")||"").includes("vnd.pgrst.object");', 'const accept=(headers&&headers.get&&headers.get("accept"))||"";const single=accept.includes("vnd.pgrst.object");');
s = s.replace("const direct=await readPublic(url,method);", "const direct=await readPublic(url,method,headers);");
if (!s.includes("readPublic(url,method,headers)")) throw new Error("sig");
fs.writeFileSync("D:/FC CLUBS/fcclubs/cloud/frontend.js", s);
console.log("patched");
