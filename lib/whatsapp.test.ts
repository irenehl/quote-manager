import { test } from "node:test";
import assert from "node:assert/strict";
import { whatsappLink } from "./whatsapp";

test("WhatsApp links normalize local and international phone numbers and encode the message", () => {
  const message = "Hola, Ana & Luis. Cotización: $122.04";
  for (const phone of ["7000-1234", "+503 7000-1234", "00503 7000 1234", "50370001234"]) {
    const url = new URL(whatsappLink(phone, message)!);
    assert.equal(url.origin, "https://wa.me");
    assert.equal(url.pathname, "/50370001234");
    assert.equal(url.searchParams.get("text"), message);
  }
  assert.equal(new URL(whatsappLink("+1 (202) 555-0123", message)!).pathname, "/12025550123");
  for (const phone of ["", "123", "llamar a 70001234", "+70001234", "1234567890123456", "70001234?text=otro"]) {
    assert.equal(whatsappLink(phone, message), null);
  }
});
