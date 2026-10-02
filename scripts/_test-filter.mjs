import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("D:/FC CLUBS/fcclubs/.env.supabase.local","utf8").split(/\r?\n/).filter(l => l && !l.startsWith("#") && l.includes("=")).map(l => { const i = l.indexOf("="); return [l.slice(0,i), l.slice(i+1)]; }));
const body = { p_collection:"ranked_profiles", p_filter:{ op:"and", children:[{ key:"mode", op:"eq", value:"team", negate:false }] }, p_order:[{ key:"elo_rating", direction:"desc" }], p_limit:1, p_offset:0 };
const t = performance.now();
const r = await fetch(env.SUPABASE_URL + "/rest/v1/rpc/fc_public_select", { method:"POST", headers:{ apikey: env.SUPABASE_ANON_KEY, Authorization:"Bearer "+env.SUPABASE_ANON_KEY, "Content-Type":"application/json" }, body: JSON.stringify(body) });
const text = await r.text();
console.log(r.status, Math.round(performance.now()-t)+"ms", text.slice(0,180));
