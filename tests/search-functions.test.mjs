import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.FC_DATA_DIR = mkdtempSync(join(tmpdir(), "fc-search-"));
const { save, db } = await import("../server/db.mjs");
const { invoke } = await import("../server/rpc.mjs");
const { register, login } = await import("../server/auth.mjs");
const { allowOrigin, withQuery } = await import("../server/request-guards.mjs");

test("local dev origins on another port are allowed and foreign origins are not", () => {
  assert.equal(allowOrigin(undefined, "localhost:3000"), true);
  assert.equal(allowOrigin("http://localhost:3001", "localhost:3000"), true);
  assert.equal(allowOrigin("http://127.0.0.1:3000", "localhost:3000"), true);
  assert.equal(allowOrigin("https://localhost:3000", "localhost:3000"), true);
  assert.equal(allowOrigin("http://evil.example", "localhost:3000"), false);
  assert.equal(allowOrigin("http://localhost:3000", "evil.example"), false);
  assert.equal(allowOrigin("not a url", "localhost:3000"), false);
});

test("function query string fills an empty GET body without overriding JSON", () => {
  assert.deepEqual(withQuery({}, new URLSearchParams("query=ana")), { query: "ana" });
  assert.deepEqual(withQuery({ query: "body" }, new URLSearchParams("query=url&federationId=1")), { query: "body", federationId: "1" });
});

test("search-users requires auth, hides emails from members, and escapes wildcards", () => {
  save("users_profile", { id: "u1", display_name: "Ana Silva", full_name: "Ana", email: "ana@example.test" });
  save("users_profile", { id: "u2", display_name: "Bruno", email: "bruno_100%@example.test" });
  assert.throws(() => invoke("search-users", { query: "Ana" }, null), /login/);
  assert.deepEqual(invoke("search-users", { query: "Ana" }, { id: "u1", role: "member" }), [{ user_id: "u1", display_name: "Ana Silva", email: null }]);
  const wildcard = invoke("search-users", { query: "100%" }, { id: "u1", role: "member" });
  assert.deepEqual(wildcard, [{ user_id: "u2", display_name: "Bruno", email: null }]);
  assert.deepEqual(invoke("search-users", { query: "a_a" }, { id: "u1", role: "member" }), []);
  const admin = invoke("search-users", { query: "@@ALL@@" }, { id: "admin", role: "admin" });
  assert.equal(admin.find(row => row.user_id === "u2").email, "bruno_100%@example.test");
  assert.throws(() => invoke("search-users", { query: "@@ALL@@" }, { id: "u1", role: "member" }), /permiss/);
});

test("tournament entrant search is case-insensitive, unambiguous, and game scoped", () => {
  save("teams", { id: "t1", name: "Real Club", tag: "RCL", game_id: "fc" });
  save("teams", { id: "t2", name: "Real Club", tag: "OTHER", game_id: "fc" });
  save("teams", { id: "t3", name: "Solo FC", game_id: "fc" });
  save("player_profiles", { id: "p1", handle: "AnaPlayer", game_id: "fc" });
  const teams = invoke("search-tournament-entrants", { type: "team", names: ["solo fc", "Nobody", "Real Club"], game_id: "fc" }, null);
  assert.deepEqual(teams.found.map(row => row.id), ["t3"]);
  assert.deepEqual(teams.not_found, ["Nobody", "Real Club"]);
  const partial = invoke("search-tournament-entrants", { type: "team", names: ["solo"], game_id: "fc" }, null);
  assert.equal(partial.found[0].id, "t3");
  const players = invoke("search-tournament-entrants", { type: "player", names: ["anaplayer"] }, null);
  assert.equal(players.found[0].id, "p1");
});

test("a corrupt password hash is an authentication failure, not a server error", () => {
  register("admin-edge@example.test", "password12345", "Edge");
  db.prepare("UPDATE accounts SET password=? WHERE email=?").run("not-a-hash", "admin-edge@example.test");
  assert.throws(() => login("admin-edge@example.test", "password12345"), error => error.status === 401);
});
