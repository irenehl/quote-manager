import { CatalogItem } from "./types";
export const catalogSeed: CatalogItem[] = [
  ["LONA-13", "Lona publicitaria 13oz", 1800, "m²", "area"],
  ["VINIL-ADH", "Vinil adhesivo brillante", 2200, "m²", "area"],
  ["VINIL-MICRO", "Vinil microperforado", 2800, "m²", "area"],
  ["TARJ-MIL", "Tarjetas de presentación", 8500, "millar", "millar"],
  ["VOL-A5", "Volantes A5 full color", 9500, "millar", "millar"],
  ["VOL-A4", "Volantes A4 full color", 14500, "millar", "millar"],
  ["AFI-A3", "Afiche A3 couché 150 g", 650, "unidad", "unit"],
  ["AFI-A2", "Afiche A2 couché 150 g", 1200, "unidad", "unit"],
  ["ROLLUP", "Pendón roll-up 80×200 cm", 9500, "unidad", "unit"],
  ["STICK-50", "Stickers circular 5 cm", 3500, "paquete 50", "package"],
  ["PVC-3", "Señalética PVC 3 mm", 4500, "m²", "area"],
  ["CARP", "Carpeta con bolsillo", 480, "unidad", "unit"],
].map(
  ([sku, name, priceCents, unit, qtyMode]) =>
    ({ sku, name, priceCents, unit, qtyMode }) as CatalogItem,
);
