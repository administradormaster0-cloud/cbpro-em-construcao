import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("D:/FC CLUBS/fcclubs/.env.supabase.local","utf8").split(/\r?\n/).filter(l => l && !l.startsWith("#") && l.includes("=")).map(l => { const i = l.indexOf("="); return [l.slice(0,i), l.slice(i+1)]; }));
const root = env.SUPABASE_URL;
const anon = env.SUPABASE_ANON_KEY;
async function call(name, body) {
  const t = performance.now();
  const r = await fetch(root + "/rest/v1/rpc/fc_public_select", {
    method: "POST",
    headers: { apikey: anon, Authorization: "Bearer " + anon, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const text = await r.text();
  console.log(name, r.status, Math.round(performance.now()-t) + "ms", "bytes", text.length, text.slice(0, 140).replaceAll("\n"," "));
}
await call("ranked", { p_collection: "ranked_profiles", p_filter: { op:"and", children:[] }, p_order: [{ key:"elo_rating", direction:"desc" }], p_limit: 2, p_offset: 0 });
await call("ads", { p_collection: "recruitment_ads", p_filter: { op:"and", children:[] }, p_order: [], p_limit: 2, p_offset: 0 });
await call("private", { p_collection: "users_profile", p_filter: { op:"and", children:[] }, p_order: [], p_limit: 1, p_offset: 0 });
await call("ranked2", { p_collection: "ranked_profiles", p_filter: { op:"and", children:[] }, p_order: [{ key:"elo_rating", direction:"desc" }], p_limit: 2, p_offset: 0 });
