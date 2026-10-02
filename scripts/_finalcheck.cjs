const fs = require("fs");
const s = fs.readFileSync("D:/FC CLUBS/fcclubs/data/hostinger-release/js/index-ef287076.js","utf8");
console.log("setState", s.includes("enqueueSetState"));
console.log("createRoot", s.includes("createRoot(document.getElementById"));
console.log("fc placeholder", s.includes("__SUPABASE"));
