import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.FC_DATA_DIR = mkdtempSync(join(tmpdir(), "fc-mail-"));
const { db } = await import("../server/db.mjs");
const { register, login, requestRecovery, requestMagicLink, updateAccount, safeAppRedirect } = await import("../server/auth.mjs");

test("password recovery emails a one-hour link and unknown addresses stay silent", async () => {
  register("player@example.test", "password12345", "Player");
  const sent = [];
  const send = async message => { sent.push(message); };
  const known = await requestRecovery("Player@example.test", "http://localhost:3000/reset-password", send);
  assert.equal(known.sent, true);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, "player@example.test");
  assert.match(sent[0].text, /type=recovery/);
  assert.match(sent[0].text, /access_token=/);
  assert.doesNotMatch(sent[0].text, /password12345/);
  const unknown = await requestRecovery("missing@example.test", "http://localhost:3000/reset-password", send);
  assert.equal(unknown.sent, false);
  assert.equal(sent.length, 1);
});

test("the recovery link can set a new password", async () => {
  const sent = [];
  await requestRecovery("player@example.test", "http://localhost:3000/reset-password", async message => sent.push(message));
  const link = new URL(sent[0].text.split("\n").find(line => line.startsWith("http")));
  const params = new URLSearchParams(link.hash.slice(1));
  const { authenticate } = await import("../server/auth.mjs");
  const user = authenticate({ headers: { authorization: "Bearer " + params.get("access_token") } });
  assert.equal(user.email, "player@example.test");
  updateAccount(user, { password: "nova-senha-123" });
  assert.throws(() => login("player@example.test", "password12345"), error => error.status === 401);
  assert.equal(login("player@example.test", "nova-senha-123").user.email, "player@example.test");
});

test("magic links are not sent when account creation is disabled", async () => {
  let calls = 0;
  const send = async () => { calls++; };
  const blocked = await requestMagicLink("fresh@example.test", "http://127.0.0.1:3000/", false, send);
  assert.equal(blocked.sent, false);
  assert.equal(calls, 0);
  const created = await requestMagicLink("fresh@example.test", "http://127.0.0.1:3000/", true, send);
  assert.equal(created.sent, true);
  assert.equal(calls, 1);
  assert.equal(safeAppRedirect("https://evil.example/phish", "localhost:3000", "/reset-password"), "http://localhost:3000/reset-password");
});

test.after(() => db.close());
