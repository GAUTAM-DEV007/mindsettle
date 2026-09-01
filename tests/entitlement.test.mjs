import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Next resolves this build-time boundary marker itself. The isolated unit
// harness removes only that marker; the actual entitlement logic is unmodified.
const source = (await readFile(new URL("../lib/access/entitlement.js", import.meta.url), "utf8"))
  .replace('import "server-only";', "");
const { resolveVideoAccess, resolveCatalogueAccess } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);
const user = { id: "viewer", app_metadata: {} };
const freeVideo = { id: "free-video", min_tier: 0 };

function database(options = {}) {
  const calls = [];
  return {
    calls,
    from(table) {
      let head = false;
      const result = () => {
        if (table === "user_roles") return { data: { role: options.role || "user" } };
        if (table === "free_video_claims") {
          if (options.storeError) return { error: { code: "missing_table" } };
          return head ? { count: options.used ?? 0 } : { data: options.claimed ? { video_id: freeVideo.id } : null };
        }
        return { data: null };
      };
      const query = {
        select(_fields, settings) { head = settings?.head === true; return query; },
        eq() { return query; },
        in() { return query; },
        limit() { return query; },
        order() { return query; },
        maybeSingle() { return Promise.resolve(result()); },
        then(resolve, reject) { return Promise.resolve(result()).then(resolve, reject); },
      };
      return query;
    },
    async rpc(name, args) {
      calls.push({ name, args });
      if (name === "user_has_active_entitlement") return { data: (options.tier ?? 0) >= args.required_tier };
      if (name === "claim_free_video") {
        if (options.claimError) return { error: { code: "unavailable" } };
        return { data: [{ allowed: options.claimAllowed ?? true, free_views_remaining: options.remaining ?? 2 }] };
      }
      throw new Error(`Unexpected RPC ${name}`);
    },
  };
}

test("anonymous and temporary-password sessions cannot play media", async () => {
  assert.equal((await resolveVideoAccess(database(), null, freeVideo)).requiresLogin, true);
  const access = await resolveVideoAccess(database({ role: "admin" }), { ...user, app_metadata: { must_change_password: true } }, freeVideo);
  assert.equal(access.allowed, false);
  assert.equal(access.requiresPasswordChange, true);
});

test("admins and subscribers do not consume free claims", async () => {
  for (const options of [{ role: "admin" }, { tier: 1 }]) {
    const db = database(options);
    const access = await resolveVideoAccess(db, user, freeVideo, { recordView: true });
    assert.equal(access.allowed, true);
    assert.equal(access.freeViewsRemaining, null);
    assert.equal(db.calls.some(call => call.name === "claim_free_video"), false);
  }
});

test("premium access checks the required tier", async () => {
  assert.equal((await resolveVideoAccess(database({ tier: 1 }), user, { id: "premium", min_tier: 2 })).allowed, false);
  assert.equal((await resolveVideoAccess(database({ tier: 2 }), user, { id: "premium", min_tier: 2 })).allowed, true);
});

test("opening a free video uses the atomic reservation result", async () => {
  const db = database({ remaining: 1 });
  const access = await resolveVideoAccess(db, user, freeVideo, { recordView: true });
  assert.equal(access.allowed, true);
  assert.equal(access.freeViewsRemaining, 1);
  assert.equal(db.calls.filter(call => call.name === "claim_free_video").length, 1);
  assert.equal((await resolveVideoAccess(database({ claimAllowed: false, remaining: 0 }), user, freeVideo, { recordView: true })).requiresUpgrade, true);
});

test("failed reservations and unreadable claim storage fail closed", async () => {
  for (const [db, options] of [[database({ claimError: true }), { recordView: true }], [database({ storeError: true }), {}]]) {
    const access = await resolveVideoAccess(db, user, freeVideo, options);
    assert.equal(access.allowed, false);
    assert.equal(access.unavailable, true);
  }
});

test("hover previews cannot claim or expose an unopened free video", async () => {
  const db = database();
  const access = await resolveVideoAccess(db, user, freeVideo, { allowUnclaimedFree: false });
  assert.equal(access.allowed, false);
  assert.equal(db.calls.some(call => call.name === "claim_free_video"), false);
  assert.equal((await resolveVideoAccess(database({ claimed: true, used: 3 }), user, freeVideo, { allowUnclaimedFree: false })).allowed, true);
});

test("catalogue browsing never reserves playback", async () => {
  const db = database();
  const result = await resolveCatalogueAccess(db, user, [freeVideo, { id: "premium", min_tier: 1 }]);
  assert.equal(result.get(freeVideo.id).allowed, true);
  assert.equal(result.get("premium").allowed, false);
  assert.equal(db.calls.some(call => call.name === "claim_free_video"), false);
});
