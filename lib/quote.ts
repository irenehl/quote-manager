import { CatalogItem, Line } from "./types";
export function repriceLines(lines: Line[], catalog: CatalogItem[]): Line[] {
  if (!Array.isArray(lines) || lines.length > 50)
    throw new Error("Revisa los productos del pedido.");
  return lines.map((line) => {
    const item = catalog.find((i) => i.sku === line.sku);
    if (!item) throw new Error("Selecciona un producto de la lista.");
    let quantity = Number(line.quantity);
    const result: Line = {
      sku: item.sku,
      name: item.name,
      unit: item.unit,
      priceCents: item.priceCents,
      quantity,
    };
    if (item.qtyMode === "area") {
      result.pieces = Number(line.pieces);
      result.width = Number(line.width);
      result.height = Number(line.height);
      quantity =
        Math.round(result.pieces * result.width * result.height * 1000000) /
        1000000;
      result.quantity = quantity;
      if (
        !Number.isInteger(result.pieces) ||
        result.pieces <= 0 ||
        result.width <= 0 ||
        result.height <= 0
      )
        throw new Error(
          "Completa piezas, ancho y alto con valores mayores que cero.",
        );
    }
    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 1000000)
      throw new Error(
        "La cantidad debe ser mayor que cero y menor o igual a 1,000,000.",
      );
    if (
      (item.qtyMode === "unit" || item.qtyMode === "package") &&
      !Number.isInteger(quantity)
    )
      throw new Error("Unidades y paquetes deben ser cantidades enteras.");
    return result;
  });
}
export function lineSummary(lines: Line[]) {
  return lines
    .map((l) => {
      const n = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
      return l.unit === "millar"
        ? `${n.format(l.quantity * 1000)} ${l.sku === "TARJ-MIL" ? "tarjetas" : "volantes"}`
        : l.unit === "paquete 50"
          ? `${n.format(l.quantity * 50)} stickers`
          : `${n.format(l.quantity)} ${l.unit} · ${l.name}`;
    })
    .join(" · ");
}
