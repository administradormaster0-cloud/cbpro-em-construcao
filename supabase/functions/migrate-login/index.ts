import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const OLD_URL = "https://pkoysigjsorpefekkiqf.supabase.co";
const OLD_KEY = "sb_publishable_UANCv-yxe0ndcLf13IbuMg_o4F1meIo";
const PROTECTED = new Set([
  "administradormaster0@gmail.com",
  "mateus567890@gmail.com",
]);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function safeId(value: unknown) {
  return typeof value === "string" && /^[0-9a-zA-Z_-]{1,80}$/.test(value) ? value : "";
}

async function readOld(access: string, path: string) {
  const response = await fetch(`${OLD_URL}/rest/v1/${path}`, {
    headers: { apikey: OLD_KEY, Authorization: `Bearer ${access}`, Accept: "application/json" },
  });
  const text = await response.text();
  if (!response.ok) return { ok: false, status: response.status, rows: [] as Record<string, unknown>[] };
  try {
    const parsed = JSON.parse(text);
    return { ok: true, status: response.status, rows: Array.isArray(parsed) ? parsed as Record<string, unknown>[] : [] };
  } catch {
    return { ok: false, status: response.status, rows: [] as Record<string, unknown>[] };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ migrated: false }, 405);

  let email = "";
  let password = "";
  try {
    const body = await req.json();
    email = String(body?.email ?? "").trim().toLowerCase();
    password = String(body?.password ?? "");
  } catch {
    return json({ migrated: false }, 400);
  }
  if (!email.includes("@") || email.length > 320 || !password || password.length > 200) {
    return json({ migrated: false }, 400);
  }
  if (PROTECTED.has(email)) return json({ migrated: false, reason: "exists" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) return json({ migrated: false }, 500);
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const existingResponse = await fetch(
    `${supabaseUrl}/auth/v1/admin/users?filter=${encodeURIComponent(email)}`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
  );
  if (!existingResponse.ok) return json({ migrated: false }, 500);
  const existingBody = await existingResponse.json();
  const existingUsers = Array.isArray(existingBody) ? existingBody : existingBody?.users ?? [];
  if (existingUsers.some((user: { email?: string }) => String(user?.email ?? "").toLowerCase() === email)) {
    return json({ migrated: false, reason: "exists" });
  }

  const grant = await fetch(`${OLD_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: OLD_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!grant.ok) {
    await grant.body?.cancel();
    return json({ migrated: false }, 401);
  }
  const session = await grant.json();
  const oldId = safeId(session?.user?.id);
  const access = typeof session?.access_token === "string" ? session.access_token : "";
  if (!oldId || !access) return json({ migrated: false }, 401);

  const profileRead = await readOld(access, `users_profile?id=eq.${oldId}&select=*`);
  let rolesRead = await readOld(access, `user_roles?user_id=eq.${oldId}&select=id,user_id,role_id,roles(id,key,name)`);
  if (!rolesRead.ok) rolesRead = await readOld(access, `user_roles?user_id=eq.${oldId}&select=*`);
  const playersRead = await readOld(access, `player_profiles?user_id=eq.${oldId}&select=*`);
  const playerIds = playersRead.rows.map((row) => safeId(row.id)).filter(Boolean);
  const teamReads = [];
  for (let index = 0; index < playerIds.length; index += 80) {
    const list = playerIds.slice(index, index + 80).join(",");
    teamReads.push(await readOld(access, `team_players?player_profile_id=in.(${list})&select=*`));
  }
  const ownedRead = await readOld(access, `teams?owner_user_id=eq.${oldId}&select=*`);
  console.log(JSON.stringify({
    profile: profileRead.status,
    roles: rolesRead.status,
    players: playersRead.status,
    teams: teamReads.map((item) => item.status),
    owned: ownedRead.status,
  }));
  if (!profileRead.ok) return json({ migrated: false }, 502);

  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (created.error || !created.data.user?.id) {
    const message = created.error?.message ?? "";
    if (/already|registered|exists/i.test(message)) return json({ migrated: false, reason: "exists" });
    return json({ migrated: false }, 500);
  }
  const newId = created.data.user.id;
  const rollback = async () => {
    await admin.auth.admin.deleteUser(newId);
  };

  const rank: Record<string, number> = { USER: 1, ADMIN: 2, SUPERADMIN: 3 };
  const roleRows = rolesRead.rows.map((row) => {
    const rawRole = row.roles;
    const embedded = (Array.isArray(rawRole) ? rawRole[0] : rawRole) as Record<string, unknown> | null;
    const roleObject = embedded && typeof embedded === "object" ? embedded : null;
    return {
      id: safeId(row.id),
      user_id: safeId(row.user_id) || oldId,
      role_id: safeId(row.role_id) || safeId(roleObject?.id),
      key: typeof roleObject?.key === "string" ? roleObject.key : "",
      name: typeof roleObject?.name === "string" ? roleObject.name : "",
    };
  }).filter((row) => row.role_id);
  if (rolesRead.ok && roleRows.some((row) => !row.key)) {
    for (const row of roleRows) {
      if (row.key) continue;
      const roleRead = await readOld(access, `roles?id=eq.${row.role_id}&select=id,key,name`);
      const role = roleRead.rows[0];
      if (role) {
        row.key = typeof role.key === "string" ? role.key : "";
        row.name = typeof role.name === "string" ? role.name : "";
      }
    }
  }
  const best = roleRows.reduce<{ key: string; name: string; rank: number }>(
    (current, row) => {
      const score = rank[row.key] ?? 0;
      return score >= current.rank ? { key: row.key, name: row.name || row.key, rank: score } : current;
    },
    { key: "", name: "", rank: 0 },
  );

  const { data: emailRows, error: emailError } = await admin
    .from("fc_runtime_records")
    .select("id,doc")
    .eq("collection", "users_profile")
    .filter("doc->>email", "ilike", email);
  if (emailError) { await rollback(); return json({ migrated: false }, 500); }
  const existingProfile = (emailRows ?? []).find((row) => String(row.doc?.email ?? "").toLowerCase() === email) ?? null;
  const profileId = existingProfile?.id || oldId;
  const oldProfile = profileRead.rows[0] ?? {};
  const displayName = typeof oldProfile.display_name === "string" && oldProfile.display_name.trim()
    ? oldProfile.display_name.trim()
    : email.split("@")[0];
  const profileDoc = {
    ...(existingProfile?.doc ?? {}),
    ...oldProfile,
    id: profileId,
    email,
    display_name: displayName,
    gamertag: displayName,
    legacy_user_id: oldId,
    auth_user_id: newId,
    cargo: best.name || best.key || (existingProfile?.doc?.cargo ?? ""),
    role_key: best.key || (existingProfile?.doc?.role_key ?? ""),
  };

  const changes: { action: "save"; collection: string; id: string; doc: Record<string, unknown> }[] = [];
  const push = (collection: string, id: string, doc: Record<string, unknown>) => {
    if (!safeId(id)) return;
    changes.push({ action: "save", collection, id, doc: { ...doc, id } });
  };

  const wanted = new Map<string, string[]>();
  const add = (collection: string, id: string) => {
    if (!safeId(id)) return;
    const list = wanted.get(collection) ?? [];
    list.push(id);
    wanted.set(collection, list);
  };
  add("users_profile", profileId);
  for (const row of roleRows) {
    add("roles", row.role_id);
    if (row.id) add("user_roles", row.id);
  }
  for (const row of playersRead.ok ? playersRead.rows : []) add("player_profiles", safeId(row.id));
  for (const read of teamReads) {
    if (!read.ok) continue;
    for (const row of read.rows) add("team_players", safeId(row.id));
  }
  for (const row of ownedRead.ok ? ownedRead.rows : []) add("teams", safeId(row.id));

  const existingDocs = new Map<string, Record<string, unknown>>();
  for (const [collection, ids] of wanted) {
    const unique = [...new Set(ids)];
    for (let index = 0; index < unique.length; index += 100) {
      const slice = unique.slice(index, index + 100);
      const { data, error } = await admin.from("fc_runtime_records").select("id,doc").eq("collection", collection).in("id", slice);
      if (error) { await rollback(); return json({ migrated: false }, 500); }
      for (const row of data ?? []) existingDocs.set(`${collection}\0${row.id}`, row.doc ?? {});
    }
  }

  push("users_profile", profileId, profileDoc);
  for (const row of roleRows) {
    const current = existingDocs.get(`roles\0${row.role_id}`);
    if (!current) push("roles", row.role_id, { id: row.role_id, key: row.key, name: row.name || row.key });
    const roleId = row.id || `${oldId}-${row.role_id}`;
    const currentRole = existingDocs.get(`user_roles\0${roleId}`) ?? {};
    push("user_roles", roleId, { ...currentRole, id: roleId, user_id: oldId, role_id: row.role_id, legacy_user_id: oldId });
  }
  const copyRows = (collection: string, rows: Record<string, unknown>[]) => {
    for (const row of rows) {
      const id = safeId(row.id);
      if (!id) continue;
      const current = existingDocs.get(`${collection}\0${id}`) ?? {};
      push(collection, id, { ...current, ...row, id });
    }
  };
  if (playersRead.ok) copyRows("player_profiles", playersRead.rows);
  for (const read of teamReads) if (read.ok) copyRows("team_players", read.rows);
  if (ownedRead.ok) copyRows("teams", ownedRead.rows);

  for (let start = 0; start < changes.length; start += 500) {
    const batch = changes.slice(start, start + 500);
    let saved = false;
    for (let attempt = 0; attempt < 4 && !saved; attempt++) {
      const { data: state, error: stateError } = await admin.from("fc_runtime_state").select("revision").eq("id", 1).single();
      if (stateError || state?.revision === undefined || state?.revision === null) { await rollback(); return json({ migrated: false }, 500); }
      const { error } = await admin.rpc("fc_runtime_commit", {
        p_operation: crypto.randomUUID(),
        p_revision: state.revision,
        p_changes: batch,
      });
      if (!error) saved = true;
      else if (error.code !== "40001" && !String(error.message ?? "").includes("FC_REVISION_CONFLICT")) { await rollback(); return json({ migrated: false }, 500); }
    }
    if (!saved) { await rollback(); return json({ migrated: false }, 500); }
  }

  return json({ migrated: true });
});
