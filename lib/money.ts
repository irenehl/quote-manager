import { IVA_RATE, Line } from "./types";
export const formatPen = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
export function totals(lines: Line[]) {
  const subtotal = lines.reduce(
    (sum, line) => sum + Math.round(line.quantity * line.priceCents),
    0,
  );
  const tax = Math.round(subtotal * IVA_RATE);
  return { subtotal, tax, total: subtotal + tax };
}
