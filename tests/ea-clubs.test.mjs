import test from "node:test";
import assert from "node:assert/strict";
import { searchEaClubs } from "../server/ea-clubs.mjs";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

test("live club search maps the public EA payload and drops the local snapshot shape", async () => {
  const result = await searchEaClubs("arsenal", { fetch: async url => {
    const platform = new URL(url).searchParams.get("platform");
    assert.equal(new URL(url).origin + new URL(url).pathname, "https://proclubs.ea.com/api/fc/allTimeLeaderboard/search");
    if (platform !== "common-gen5") return jsonResponse([]);
    return jsonResponse([{ clubId: "387444", clubName: "Arsenal FC", members: [{ name: "Ana" }, { personaName: "Bruno" }, "Caio", "Extra"] }]);
  }});
  assert.deepEqual(result, { results: [{ clubId: 387444, clubName: "Arsenal FC", platform: "common-gen5", members: ["Ana", "Bruno", "Caio"] }] });
  assert.equal("clubs" in result, false);
});

test("an EA 403 is reported as EA_HTTP_403 instead of local teams", async () => {
  await assert.rejects(
    () => searchEaClubs("arsenal", { fetch: async () => new Response("<html>Access Denied</html>", { status: 403 }) }),
    error => error.status === 403 && error.provider_code === "EA_HTTP_403"
  );
});

test('mixed EA failures never pretend that the search succeeded with zero clubs',async()=>{
 let call=0;
 await assert.rejects(()=>searchEaClubs('arsenal',{fetch:async()=>++call===1?new Response('Denied',{status:403}):new Response('Unavailable',{status:503})}),e=>e.status===503);
});
