import test from "node:test";
import assert from "node:assert/strict";
import { getSafeRedirectPath } from "../lib/auth/redirects.js";
import { getOAuthCallbackUrl } from "../lib/auth/oauth.js";
import { calculateOrganisationPrice, clampOrganisationSeats } from "../lib/billing/organisation-pricing.js";
import { getInvoiceSubscriptionId, getPurchasedSeatQuantity } from "../lib/billing/stripe-shapes.js";

test("login redirects accept only safe local destinations", () => {
  assert.equal(getSafeRedirectPath("/library/123?play=1#session"), "/library/123?play=1#session");
  for (const unsafe of [
    null, "", "https://attacker.example", "//attacker.example", "/\\attacker.example",
    "/\n/attacker.example", "javascript:alert(1)", "/.//attacker.example",
    "/page/..//attacker.example", "/" + "a".repeat(2048),
  ]) {
    assert.equal(getSafeRedirectPath(unsafe), "/post-login", String(unsafe));
  }
});

test("social sign-in callbacks preserve only safe local return paths", () => {
  assert.equal(
    getOAuthCallbackUrl("https://app.example", "/library/123?play=1"),
    "https://app.example/auth/callback?redirectTo=%2Flibrary%2F123%3Fplay%3D1",
  );
  assert.equal(
    getOAuthCallbackUrl("https://app.example", "https://attacker.example"),
    "https://app.example/auth/callback?redirectTo=%2Fpost-login",
  );
  assert.throws(() => getOAuthCallbackUrl("javascript:alert(1)"), /HTTP or HTTPS/);
});

test("organisation pricing respects graduated seat boundaries", () => {
  for (const [seats, cents] of [[5, 4975], [20, 19900], [21, 20567], [50, 39910], [51, 40510], [100, 69910], [101, 70460], [500, 289910]]) {
    assert.equal(calculateOrganisationPrice(seats).totalCents, cents);
  }
  for (let seats = 6; seats <= 500; seats++) {
    assert.ok(calculateOrganisationPrice(seats).totalCents > calculateOrganisationPrice(seats - 1).totalCents);
  }
});

test("invalid seat selections are bounded", () => {
  assert.equal(clampOrganisationSeats(-50), 5);
  assert.equal(clampOrganisationSeats(501), 500);
  assert.equal(clampOrganisationSeats(Infinity), 20);
  assert.equal(clampOrganisationSeats("invalid"), 20);
});

test("Stripe renewals preserve legacy fixed-package seats", () => {
  assert.equal(getPurchasedSeatQuantity({ type: "organisation", slug: "organisation-professional", seat_limit: 50 }, { quantity: 1 }), 50);
  assert.equal(getPurchasedSeatQuantity({ type: "organisation", slug: "organisation-flex" }, { quantity: 75 }), 75);
  assert.equal(getPurchasedSeatQuantity({ type: "individual" }, { quantity: 75 }), 1);
  assert.equal(getPurchasedSeatQuantity({ type: "organisation", slug: "organisation-flex" }, { quantity: -1 }), 1);
});

test("Stripe invoices link modern and legacy subscription shapes", () => {
  assert.equal(getInvoiceSubscriptionId({ parent: { subscription_details: { subscription: { id: "sub_new" } } } }), "sub_new");
  assert.equal(getInvoiceSubscriptionId({ subscription: "sub_old" }), "sub_old");
  assert.equal(getInvoiceSubscriptionId({}), null);
});
