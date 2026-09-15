import { CatalogItem, Line } from "./types";
export const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/×/g, "x")
    .replace(/,/g, ".");
// Specific alternatives precede generic aliases; every occurrence becomes a line.
const pattern =
  /vinil\s+microperforado|volantes?(?:\s+a[45])?|hoja partida|afiches?(?:\s+a[23])?|pendones?(?:\s+roll[ -]?up)?|roll[ -]?ups?|lonas?|vinil|tarjetas?|stickers?|pvc|senaletica|carpetas?/g;
export function matchMessage(message: string, catalog: CatalogItem[]) {
  const text = fold(message);
  const hits = [...text.matchAll(pattern)];
  const lines: Line[] = [];
  const issues: string[] = [];
  for (let i = 0; i < hits.length; i++) {
    const hit = hits[i];
    const alias = hit[0];
    const start = hit.index!;
    const end = hits[i + 1]?.index ?? text.length;
    if (
      alias === "hoja partida" &&
      i > 0 &&
      hits[i - 1][0].startsWith("volante")
    )
      continue;
    const local = text.slice(start, end);
    const following = text.slice(start, Math.min(text.length, end + 12));
    const sku = alias.startsWith("lona")
      ? "LONA-13"
      : alias.includes("microperforado")
        ? "VINIL-MICRO"
        : alias === "vinil"
          ? "VINIL-ADH"
          : alias.startsWith("tarjeta")
            ? "TARJ-MIL"
            : alias.startsWith("volante") || alias === "hoja partida"
              ? alias.includes("a4")
                ? "VOL-A4"
                : "VOL-A5"
              : alias.startsWith("afiche")
                ? alias.includes("a2")
                  ? "AFI-A2"
                  : "AFI-A3"
                : /pendon|roll/.test(alias)
                  ? "ROLLUP"
                  : alias.startsWith("sticker")
                    ? "STICK-50"
                    : alias.startsWith("carpeta")
                      ? "CARP"
                      : "PVC-3";
    const item = catalog.find((x) => x.sku === sku);
    if (!item) {
      issues.push(`Producto fuera de la lista: ${alias}.`);
      continue;
    }
    const before = text.slice(
      i ? hits[i - 1].index! + hits[i - 1][0].length : 0,
      start,
    );
    const count = before.match(
      /(?:^|\s)(\d+(?:\.\d+)?|un|una|dos|tres)\s*(mil(?:es|lares)?|millares)?\s*$/,
    );
    if (
      /-\s*\d+(?:\.\d+)?\s*$/.test(before) ||
      /-\s*\d+(?:\.\d+)?\s*x|x\s*-/.test(local)
    )
      issues.push("Revisa las cantidades y medidas: no pueden ser negativas.");
    const words: Record<string, number> = { un: 1, una: 1, dos: 2, tres: 3 };
    const units = count
      ? (words[count[1]] ?? Number(count[1])) * (count[2] ? 1000 : 1)
      : 0;
    let quantity = units;
    let pieces: number | undefined;
    let width: number | undefined;
    let height: number | undefined;
    if (item.qtyMode === "area") {
      pieces = count ? units : 1;
      const dims = local.match(
        /(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*(cm|m)?/,
      );
      if (dims) {
        const scale = dims[3] === "cm" ? 0.01 : 1;
        width = Number(dims[1]) * scale;
        height = Number(dims[2]) * scale;
        quantity = Math.round(pieces * width * height * 1000000) / 1000000;
      } else quantity = 0;
    } else if (item.qtyMode === "millar") quantity = units / 1000;
    else if (item.qtyMode === "package") quantity = Math.ceil(units / 50);
    if (quantity <= 0)
      issues.push(
        `Completa ${item.qtyMode === "area" ? "las medidas" : "la cantidad"} de ${item.name.toLowerCase()}.`,
      );
    if (alias === "afiche" || alias === "afiches")
      issues.push("Confirma el tamaño del afiche.");
    if (alias.startsWith("volante") && !/a[45]|hoja partida/.test(following))
      issues.push("Confirma el tamaño de los volantes.");
    lines.push({
      sku,
      name: item.name,
      unit: item.unit,
      priceCents: item.priceCents,
      quantity,
      pieces,
      width,
      height,
    });
  }
  for (const clause of text.split(/\+|;|\s+y\s+/)) {
    if (
      /\b\d+\s+[a-z]/.test(clause) &&
      !new RegExp(pattern.source).test(clause) &&
      !/^\s*(gracias|para|de)\b/.test(clause)
    )
      issues.push(
        "Hay una parte del pedido que no pude identificar. Revisa el mensaje completo.",
      );
  }
  if (!lines.length)
    issues.push(
      "Selecciona los productos de la lista y completa las cantidades.",
    );
  return { lines, issues: [...new Set(issues)] };
}
