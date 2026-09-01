import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = (await readFile(new URL("../app/admin/users-actions.js", import.meta.url), "utf8"))
  .replace(/^import .*;\r?$/gm, "");
const targetId = "11111111-1111-4111-8111-111111111111";
const adminId = "22222222-2222-4222-8222-222222222222";

async function fixture(result) {
  const harness = `
    export const deletedUsers = [];
    const requireRole = async () => ({user: {id: ${JSON.stringify(adminId)}}});
    const revalidatePath = () => {};
    const redirect = url => { throw new Error(decodeURIComponent(url)); };
    const createAdminClient = () => ({
      from: () => {
        const query = { select: () => query, eq: () => query, not: () => query, neq: () => query,
          limit: async () => (${JSON.stringify(result)}) };
        return query;
      },
      auth: {admin: {deleteUser: async id => { deletedUsers.push(id); return {}; }}}
    });
  `;
  return import(`data:text/javascript;base64,${Buffer.from(harness + source).toString("base64")}`);
}

test("account deletion is blocked when a Stripe subscription can still bill", async () => {
  const subject = await fixture({ data: [{ id: "subscription" }] });
  await assert.rejects(subject.deleteUserAccount(targetId), /Cancel this user's Stripe subscriptions/);
  assert.deepEqual(subject.deletedUsers, []);
});

test("account deletion fails closed when billing cannot be checked", async () => {
  const subject = await fixture({ error: { message: "database unavailable" } });
  await assert.rejects(subject.deleteUserAccount(targetId), /Could not verify billing status/);
  assert.deepEqual(subject.deletedUsers, []);
});

test("an administrator cannot delete their own account", async () => {
  const subject = await fixture({ data: [], scenario: "self" });
  await assert.rejects(subject.deleteUserAccount(adminId), /cannot delete your own/);
  assert.deepEqual(subject.deletedUsers, []);
});

test("an account without billable subscriptions can be deleted", async () => {
  const subject = await fixture({ data: [] });
  await subject.deleteUserAccount(targetId);
  assert.deepEqual(subject.deletedUsers, [targetId]);
});
