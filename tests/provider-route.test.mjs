import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = (await readFile(new URL("../app/api/auth/providers/route.js", import.meta.url), "utf8"))
  .replace('"next/server"', JSON.stringify(new URL("../node_modules/next/server.js", import.meta.url).href))
  .replace('"@/lib/supabase/url"', JSON.stringify(new URL("../lib/supabase/url.js", import.meta.url).href));
const { GET } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);

function configure(t) {
  const previous = { url: process.env.NEXT_PUBLIC_SUPABASE_URL, key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY };
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.example/rest/v1/";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-test-key";
  t.after(() => {
    for (const [name, value] of [["NEXT_PUBLIC_SUPABASE_URL", previous.url], ["NEXT_PUBLIC_SUPABASE_ANON_KEY", previous.key]]) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });
}

test("provider status exposes only supported public flags", async (t) => {
  configure(t);
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://project.example/auth/v1/settings");
    assert.equal(options.cache, "no-store");
    return Response.json({ external: { google: true, apple: false, facebook: true }, unrelated: "private" });
  });
  const response = await GET();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("cache-control"), /no-store/);
  assert.deepEqual(await response.json(), { google: true });
});

test("provider status fails safely when the auth service is unavailable", async (t) => {
  configure(t);
  t.mock.method(globalThis, "fetch", async () => { throw new Error("sensitive upstream detail"); });
  const response = await GET();
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /sensitive/);
});

test("provider status does not call upstream without configuration", async (t) => {
  configure(t);
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const fetchMock = t.mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected call"); });
  assert.equal((await GET()).status, 503);
  assert.equal(fetchMock.mock.callCount(), 0);
});
