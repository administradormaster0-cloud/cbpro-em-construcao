import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("D:/FC CLUBS/fcclubs/.env.supabase.local","utf8").split(/\r?\n/).filter(l=>l && !l.startsWith("#") && l.includes("=")).map(l=>{const i=l.indexOf("="); return [l.slice(0,i), l.slice(i+1)];}));
const root = env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!root || !key) { console.log("missing"); process.exit(1); }
async function timed(name, url, opt) {
  const t = performance.now();
  const r = await fetch(url, opt);
  const text = await r.text();
  console.log(name, r.status, Math.round(performance.now()-t)+"ms", "bytes", text.length, text.slice(0,120).replaceAll("\n"," "));
}
const headers = { apikey: key, Authorization: "Bearer "+key, "Content-Type": "application/json" };
await timed("revision", root+"/rest/v1/fc_runtime_state?id=eq.1&select=revision", { headers });
await timed("select ranked", root+"/rest/v1/rpc/fc_edge_select", { method:"POST", headers, body: JSON.stringify({ p_collection:"ranked_profiles", p_revision: null, p_filter:{op:"and",children:[]}, p_order:[{key:"elo_rating",direction:"desc"}], p_limit:5, p_offset:0 }) });
