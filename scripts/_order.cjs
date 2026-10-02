const fs = require("fs");
const s = fs.readFileSync("D:/FC CLUBS/fcclubs/cloud/frontend.js","utf8");
for (const k of ["/api/login","/api/logout","/backend/","readPublic(url","/api/","/rest/v1/"]) ) console.log(k, s.indexOf(k));
