import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createStore,
  createQuote,
  saveLines,
  finalize,
  updatePrice,
} from "./store";
import { repriceLines } from "./quote";
test("catalog overwrites a client supplied price", () => {
  const s = createStore();
  const q = s.quotes[0];
  const lines = repriceLines([{ ...q.lines[0], priceCents: 1 }], s.catalog);
  assert.equal(lines[0].priceCents, 1800);
});
test("incomplete request cannot finalize; operator can resolve and finalize", () => {
  const s = createStore();
  const q = createQuote(s, "Ana", "", "vinil para la vitrina");
  assert.throws(() => finalize(s, q.id, q.revision), /Completa/);
  saveLines(
    s,
    q.id,
    [{ ...q.lines[0], pieces: 2, width: 2, height: 1 }],
    q.revision,
  );
  assert.equal(q.lines[0].quantity, 4);
  finalize(s, q.id, q.revision);
  assert.equal(q.status, "finalizada");
  assert.equal(q.snapshot?.totals.total, 9944);
});
test("reject zero, negative, NaN, fractional pieces and noninteger packages", () => {
  const s = createStore();
  const base = s.quotes[0].lines[0];
  for (const width of [0, -1, NaN, Infinity])
    assert.throws(() => repriceLines([{ ...base, width }], s.catalog));
  assert.throws(() => repriceLines([{ ...base, pieces: 1.5 }], s.catalog));
  assert.throws(() =>
    repriceLines([{ ...s.quotes[7].lines[0], quantity: 1.5 }], s.catalog),
  );
});
test("new messages validate and receive unique numbers", () => {
  const s = createStore();
  assert.throws(() => createQuote(s, "", "", ""), /nombre/);
  const a = createQuote(s, "Ana", "", "1000 tarjetas");
  const b = createQuote(s, "Ana", "", "1000 tarjetas");
  assert.notEqual(a.number, b.number);
});
test("finalization is idempotent and stores company, tax and validity", () => {
  const s = createStore();
  const q = s.quotes[0];
  const revision = q.revision;
  finalize(s, q.id, revision);
  const original = structuredClone(q);
  finalize(s, q.id, revision);
  assert.deepEqual(q, original);
  assert.equal(q.snapshot?.company.name, "LonaPunto");
  assert.equal(q.snapshot?.ivaRate, 0.13);
  assert.equal(
    new Date(q.snapshot!.validUntil).getTime() -
      new Date(q.finalizedAt!).getTime(),
    7 * 86400000,
  );
});
