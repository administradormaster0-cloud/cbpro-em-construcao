import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("D:/FC CLUBS/fcclubs/.env.supabase.local","utf8").split(/\r?\n/).filter(l => l && !l.startsWith("#") && l.includes("=")).map(l => { const i = l.indexOf("="); return [l.slice(0,i), l.slice(i+1)]; }));
const sql = readFileSync("D:/FC CLUBS/fcclubs/supabase/fc-public-read.sql","utf8");
const r = await fetch(`https://api.supabase.com/v1/projects/${env.SUPABASE_PROJECT_REF}/database/query`, {
  method: "POST",
  headers: { Authorization: "Bearer " + env.SUPABASE_ACCESS_TOKEN, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql })
});
const text = await r.text();
console.log("status", r.status, "bytes", text.length);
if (!r.ok) console.log(text.slice(0, 500));
else console.log("ok");
