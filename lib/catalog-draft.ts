import { CatalogItem } from "./types";
export function parseCatalogItem(input: CatalogItem): CatalogItem {
  if (
    !/^[A-Z0-9-]{2,30}$/.test(input.sku) ||
    !input.name.trim() ||
    input.name.length > 120 ||
    !Number.isSafeInteger(input.priceCents) ||
    input.priceCents < 1 ||
    input.priceCents > 100000000 ||
    !["area", "millar", "package", "unit"].includes(input.qtyMode)
  )
    throw new Error("Revisa el SKU, nombre y precio (mayor que cero).");
  return {
    ...input,
    name: input.name.trim(),
    unit: {
      area: "m²",
      millar: "millar",
      package: "paquete 50",
      unit: "unidad",
    }[input.qtyMode],
  };
}
