import { test } from "node:test";
import assert from "node:assert/strict";
import { createStore, createQuote, saveContact, finalize } from "./store";

test("optional contact can be corrected without changing the parsed order", () => {
  const store = createStore();
  const quote = createQuote(store, "Cliente por identificar", "", "Necesito una lona");
  const before = structuredClone(quote);
  saveContact(store, quote.id, " Ana López ", "+503 7000-1234 ", quote.revision);
  assert.equal(quote.customer, "Ana López");
  assert.equal(quote.phone, "+503 7000-1234");
  assert.deepEqual(quote.lines, before.lines);
  assert.deepEqual(quote.issues, before.issues);
  assert.equal(quote.message, before.message);
  assert.equal(quote.status, "requiere_datos");
  assert.equal(quote.revision, before.revision + 1);
  saveContact(store, quote.id, " ", "", quote.revision);
  assert.equal(quote.customer, "Cliente por identificar");
  assert.equal(quote.phone, "");
});

test("contact updates reject invalid, stale and finalized edits", () => {
  const store = createStore();
  const quote = store.quotes[0];
  const before = structuredClone(quote);
  assert.throws(() => saveContact(store, quote.id, "a".repeat(101), "", quote.revision));
  assert.throws(() => saveContact(store, quote.id, "Ana", "1".repeat(31), quote.revision));
  assert.deepEqual(quote, before);
  saveContact(store, quote.id, "Ana", "7000-1234", quote.revision);
  assert.throws(() => saveContact(store, quote.id, "Viejo", "", before.revision), /cambió/);
  assert.throws(() => finalize(store, quote.id, before.revision), /cambiaron/);
  finalize(store, quote.id, quote.revision);
  const final = structuredClone(quote);
  assert.throws(() => saveContact(store, quote.id, "Otro", "", quote.revision), /finalizada/);
  assert.deepEqual(quote, final);
});
