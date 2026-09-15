/** Conservative metadata extraction. Missing identity never blocks a draft. */
export function readMessage(raw: string) {
  if (typeof raw !== "string" || !raw.trim() || raw.length > 5000)
    throw new Error("Pega el mensaje del pedido (máximo 5,000 caracteres).");
  const text = raw.trim();
  const named = text.match(/(?:^|\n)\s*(?:nombre|cliente)\s*:\s*([^\n]+)/i);
  const introduction = text.match(
    /\b(?:me llamo|mi nombre es)\s+([\p{L}]+(?:\s+[\p{L}]+){0,3})(?=[,.!\n]|$)/iu,
  );
  const header = text.match(
    /^(?:\[[^\]\n]+\]|\d{1,2}\/\d{1,2}\/\d{2,4},[^\n]+?\s-)[ \t]*([^:\n]+):[ \t]*/,
  );
  const phone = text.match(
    /(?:\+503[ -]?)?[267]\d{3}[ -]\d{4}\b|\+503[ -]?[267]\d{7}\b/,
  );
  const sender = header?.[1].trim();
  const customer = (
    named?.[1] ??
    introduction?.[1] ??
    (sender && !/^[+\d\s-]+$/.test(sender) ? sender : "")
  )
    .trim()
    .slice(0, 100);
  // Remove only explicit contact lines and a WhatsApp envelope, not order text.
  const order = text
    .replace(
      /^(?:nombre|cliente|tel[eé]fono|whatsapp)\s*:[^\n]*(?:\n|$)/gim,
      "",
    )
    .replace(
      /^(?:\[[^\]\n]+\]|\d{1,2}\/\d{1,2}\/\d{2,4},[^\n]+?\s-)[ \t]*([^:\n]+):[ \t]*/,
      "",
    )
    .trim();
  return {
    customer: customer || "Cliente por identificar",
    phone: phone?.[0] ?? "",
    message: order || text,
    original: text,
  };
}
