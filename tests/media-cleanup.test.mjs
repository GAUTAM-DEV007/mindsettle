import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Inject only the storage/database adapters; exercise the real cleanup code.
const source = (await readFile(new URL("../lib/media/media-service.js", import.meta.url), "utf8"))
  .replace('import "server-only";', "")
  .replace('import { getStorageProvider } from "../storage/index";', "")
  .replace('import { createClient } from "../supabase/server";', "");

async function fixture(results) {
  const harness = `
    let calls = 0;
    export const deleted = [];
    const getStorageProvider = () => ({ deleteFile: async ({path}) => { deleted.push(path); return {path}; } });
    const createClient = async () => ({ from() {
      const result = ${JSON.stringify(results)}[calls++];
      const query = { select: () => query, eq: () => query, limit: async () => result };
      return query;
    }});
  `;
  return import(`data:text/javascript;base64,${Buffer.from(harness + source).toString("base64")}`);
}

test("failed uploads do not delete files referenced by saved media", async () => {
  for (const results of [[{ data: [{ id: "saved" }] }, { data: [] }], [{ data: [] }, { data: [{ id: "thumbnail" }] }]]) {
    const subject = await fixture(results);
    assert.deepEqual(await subject.deleteUnreferencedMedia({ path: "uploads/file.mp4" }), { skipped: true });
    assert.deepEqual(subject.deleted, []);
  }
});

test("cleanup skips deletion when it cannot verify references", async () => {
  const subject = await fixture([{ error: { message: "unavailable" } }, { data: [] }]);
  await subject.deleteUnreferencedMedia({ path: "uploads/file.mp4" });
  assert.deepEqual(subject.deleted, []);
});

test("cleanup removes unreferenced files", async () => {
  const subject = await fixture([{ data: [] }, { data: [] }]);
  await subject.deleteUnreferencedMedia({ path: "uploads/orphan.mp4" });
  assert.deepEqual(subject.deleted, ["uploads/orphan.mp4"]);
});
