import { test } from "node:test";
import assert from "node:assert/strict";
import { matchMessage } from "./match";
import { catalogSeed } from "./catalog";
import { inboxSeed } from "./inbox";
import { botLineSummary } from "./quote";
test("negative quantities and measurements require operator correction", () => {
  for (const message of ["-2 lonas 2x1", "1 lona -2x1", "1 lona 2x-1"])
    assert.ok(matchMessage(message, catalogSeed).issues.length);
});
test("eight seed requests preserve intended quantities and handoff", () => {
  const results = inboxSeed.map(([, message]) =>
    matchMessage(message, catalogSeed),
  );
  assert.deepEqual(
    results.map((r) => r.lines.map((l) => [l.sku, l.quantity])),
    [
      [["LONA-13", 6]],
      [["TARJ-MIL", 1]],
      [],
      [["VOL-A5", 2]],
      [
        ["LONA-13", 6],
        ["AFI-A3", 500],
      ],
      [["VINIL-ADH", 0]],
      [["ROLLUP", 2]],
      [["STICK-50", 4]],
    ],
  );
  assert.deepEqual(
    results.map((r) => r.issues.length > 0),
    [false, false, true, false, false, true, false, false],
  );
});
test("quantity belongs to product, not a later event; specific alias is preserved", () => {
  const r = matchMessage(
    "Quiero 3 miles volantes hoja partida para un evento",
    catalogSeed,
  );
  assert.equal(r.lines[0].quantity, 3);
  assert.equal(botLineSummary(r.lines), "3,000 volantes");
});
test("repeated SKU keeps separate sizes", () => {
  const r = matchMessage("2 lonas 2x1 + 3 lonas 3x2", catalogSeed);
  assert.deepEqual(
    r.lines.map((l) => l.quantity),
    [4, 18],
  );
});
test("missing dimensions have no assumed area and partial requests are flagged", () => {
  assert.equal(
    matchMessage("Necesito vinil", catalogSeed).lines[0].quantity,
    0,
  );
  assert.ok(
    matchMessage("1 lona 2x1 + 20 camisetas", catalogSeed).issues.length,
  );
});
test("normalization, centimeters and rounded sticker packages", () => {
  assert.equal(
    matchMessage("1 lona 200×100 cm", catalogSeed).lines[0].quantity,
    2,
  );
  assert.equal(matchMessage("51 stickers", catalogSeed).lines[0].quantity, 2);
  assert.equal(
    matchMessage("1 lona 2,5x1", catalogSeed).lines[0].quantity,
    2.5,
  );
});
