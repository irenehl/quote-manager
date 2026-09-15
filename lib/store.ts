import { catalogSeed } from "./catalog";
import { inboxSeed } from "./inbox";
import { matchMessage } from "./match";
import { CatalogItem, Quote, Line, IVA_RATE } from "./types";
import { repriceLines } from "./quote";
import { totals } from "./money";
import { company } from "./company";
export type Store = { catalog: CatalogItem[]; quotes: Quote[]; nextId: number };
export function createQuote(
  store: Store,
  customer: string,
  phone: string,
  message: string,
) {
  if (
    typeof customer !== "string" ||
    !customer.trim() ||
    customer.length > 100 ||
    typeof message !== "string" ||
    !message.trim() ||
    message.length > 5000 ||
    typeof phone !== "string" ||
    phone.length > 30
  )
    throw new Error("Escribe el nombre y el pedido (máximo 5,000 caracteres).");
  const n = store.nextId++;
  const result = matchMessage(message, store.catalog);
  const now = new Date();
  const ym = new Intl.DateTimeFormat("en-CA", {
    year: "2-digit",
    month: "2-digit",
    timeZone: "America/El_Salvador",
  }).formatToParts(now);
  const prefix =
    ym.find((p) => p.type === "year")!.value +
    ym.find((p) => p.type === "month")!.value;
  const quote: Quote = {
    id: `wa-${String(n).padStart(3, "0")}`,
    number: `COT-${prefix}-${String(n).padStart(3, "0")}`,
    customer: customer.trim(),
    phone: phone.trim(),
    message: message.trim(),
    createdAt: now.toISOString(),
    status: result.issues.length ? "requiere_datos" : "por_revisar",
    ...result,
    revision: 1,
  };
  store.quotes.unshift(quote);
  return quote;
}
export function createStore(): Store {
  const store: Store = {
    catalog: structuredClone(catalogSeed),
    quotes: [],
    nextId: 1,
  };
  inboxSeed.forEach(([name, message], i) =>
    createQuote(store, name, `+503 7000-${1101 + i}`, message),
  );
  store.quotes.reverse();
  return store;
}
const scope = globalThis as typeof globalThis & { lonaStoreV2?: Store };
export function getStore() {
  return (scope.lonaStoreV2 ??= createStore());
}
export function findQuote(store: Store, id: string) {
  const q = store.quotes.find((x) => x.id === id);
  if (!q) throw new Error("Solicitud no encontrada.");
  return q;
}
export function saveLines(
  store: Store,
  id: string,
  lines: Line[],
  revision: number,
) {
  const q = findQuote(store, id);
  if (q.status === "finalizada")
    throw new Error("Esta cotización ya está finalizada.");
  if (q.revision !== revision)
    throw new Error(
      "La cotización cambió. Revisa los datos actualizados antes de guardar.",
    );
  const next = repriceLines(lines, store.catalog);
  if (!next.length) throw new Error("Agrega al menos un producto.");
  q.lines = next;
  q.issues = [];
  q.status = "por_revisar";
  q.revision++;
  return q;
}
export function saveContact(
  store: Store,
  id: string,
  customer: string,
  phone: string,
  revision: number,
) {
  const q = findQuote(store, id);
  if (q.status === "finalizada")
    throw new Error("Esta cotización ya está finalizada.");
  if (q.revision !== revision)
    throw new Error("La solicitud cambió. Cancela y vuelve a editar el cliente para cargar los datos actuales.");
  if (typeof customer !== "string" || customer.length > 100)
    throw new Error("El nombre admite hasta 100 caracteres.");
  if (typeof phone !== "string" || phone.length > 30)
    throw new Error("El teléfono admite hasta 30 caracteres.");
  q.customer = customer.trim() || "Cliente por identificar";
  q.phone = phone.trim();
  q.revision++;
  return q;
}
export function finalize(store: Store, id: string, revision: number) {
  const q = findQuote(store, id);
  if (q.status === "finalizada") return q;
  if (q.revision !== revision)
    throw new Error(
      "Los datos o precios cambiaron. Revisa el total actualizado y vuelve a finalizar.",
    );
  if (q.issues.length || !q.lines.length)
    throw new Error("Completa los datos del pedido antes de finalizar.");
  q.lines = repriceLines(q.lines, store.catalog);
  q.finalizedAt = new Date().toISOString();
  q.snapshot = {
    company: structuredClone(company),
    totals: totals(q.lines),
    ivaRate: IVA_RATE,
    validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
  };
  q.status = "finalizada";
  q.revision++;
  return q;
}
export function updatePrice(store: Store, sku: string, priceCents: number) {
  if (
    !Number.isSafeInteger(priceCents) ||
    priceCents <= 0 ||
    priceCents > 100000000
  )
    throw new Error("Escribe un precio válido mayor que cero.");
  const item = store.catalog.find((i) => i.sku === sku);
  if (!item) throw new Error("Producto no encontrado.");
  if (item.priceCents === priceCents) return;
  item.priceCents = priceCents;
  for (const q of store.quotes) {
    if (q.status !== "finalizada" && q.lines.some((l) => l.sku === sku)) {
      q.lines = q.lines.map((l) => (l.sku === sku ? { ...l, priceCents } : l));
      q.revision++;
    }
  }
}
