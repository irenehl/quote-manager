import { test } from "node:test";
import assert from "node:assert/strict";
import { createStore, saveLines, finalize, updatePrice } from "./store";
test("price edit preserves manual measurements and rejects stale review", () => {
  const s = createStore();
  const q = s.quotes[0];
  saveLines(
    s,
    q.id,
    [{ ...q.lines[0], pieces: 2, width: 4, height: 2 }],
    q.revision,
  );
  const old = q.revision;
  updatePrice(s, "LONA-13", 2000);
  assert.equal(q.lines[0].quantity, 16);
  assert.equal(q.lines[0].priceCents, 2000);
  assert.throws(() => finalize(s, q.id, old), /cambiaron/);
  finalize(s, q.id, q.revision);
  assert.equal(q.snapshot?.totals.total, 36160);
});
test("finalized documents are unaffected by catalog changes", () => {
  const s = createStore();
  const q = s.quotes[0];
  finalize(s, q.id, q.revision);
  const before = structuredClone(q);
  updatePrice(s, "LONA-13", 3000);
  assert.deepEqual(q, before);
});
test("invalid prices fail without changing catalog", () => {
  const s = createStore();
  for (const n of [0, -1, 1.5, NaN, Infinity])
    assert.throws(() => updatePrice(s, "LONA-13", n));
  assert.equal(s.catalog[0].priceCents, 1800);
});
