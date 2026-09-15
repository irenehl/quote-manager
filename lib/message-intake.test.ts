import { test } from "node:test";
import assert from "node:assert/strict";
import { readMessage } from "./message-intake";
import { matchMessage } from "./match";
import { catalogSeed } from "./catalog";
test("bare message can be prepared without invented contact details", () => {
  const r = readMessage("3 lonas 2x1");
  assert.equal(r.customer, "Cliente por identificar");
  assert.equal(r.phone, "");
  assert.equal(matchMessage(r.message, catalogSeed).lines[0].quantity, 6);
});
test("extract explicit name and Salvadoran phone while preserving original", () => {
  const raw = "Nombre: Ana López\nTeléfono: +503 7000-1234\n3 lonas 2x1";
  const r = readMessage(raw);
  assert.equal(r.customer, "Ana López");
  assert.equal(r.phone, "+503 7000-1234");
  assert.equal(r.message, "3 lonas 2x1");
  assert.equal(r.original, raw);
});
test("extract WhatsApp sender and natural introduction", () => {
  assert.equal(
    readMessage("[14/9/26, 10:30] Rosa Recinos: 1000 tarjetas").customer,
    "Rosa Recinos",
  );
  assert.equal(
    readMessage("Hola, me llamo Ana López. Necesito 3 lonas 2x1").customer,
    "Ana López",
  );
  assert.equal(
    readMessage("[14/9/26, 10:30] +503 7000-1234: 1000 tarjetas").customer,
    "Cliente por identificar",
  );
});
test("empty input is rejected and quantities are not phones", () => {
  assert.throws(() => readMessage(" "));
  assert.equal(readMessage("1000 tarjetas y 200 stickers").phone, "");
});
