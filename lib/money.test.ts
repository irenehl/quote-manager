import { test } from "node:test";
import assert from "node:assert/strict";
import { totals, formatPen } from "./money";
import { matchMessage } from "./match";
import { catalogSeed } from "./catalog";
test("Rosa subtotal and IVA are computed in cents", () => {
  assert.deepEqual(totals(matchMessage("3 lonas 2x1", catalogSeed).lines), {
    subtotal: 10800,
    tax: 1404,
    total: 12204,
  });
  assert.equal(formatPen(12204), "$122.04");
});
test("round each line before rounding tax", () => {
  assert.deepEqual(
    totals([
      { sku: "X", name: "X", unit: "m²", quantity: 1.333, priceCents: 101 },
    ]),
    { subtotal: 135, tax: 18, total: 153 },
  );
});
