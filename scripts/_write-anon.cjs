const fs = require("fs");
const env = Object.fromEntries(fs.readFileSync("D:/FC CLUBS/fcclubs/.env.supabase.local","utf8").split(/\r?\n/).filter(l => l && !l.startsWith("#") && l.includes("=")).map(l => { const i = l.indexOf("="); return [l.slice(0,i), l.slice(i+1)]; }));
fs.writeFileSync("C:/Users/Mateus/agent-tools/fc-public-read.env", "URL="+env.SUPABASE_URL+"\nANON="+env.SUPABASE_ANON_KEY+"\n");
console.log("wrote", (env.SUPABASE_ANON_KEY||"").length);
