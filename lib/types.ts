export const IVA_RATE = 0.13;
export type CatalogItem = {
  sku: string;
  name: string;
  priceCents: number;
  unit: string;
  qtyMode: "area" | "millar" | "package" | "unit";
};
export type Line = {
  sku: string;
  quantity: number;
  priceCents: number;
  name: string;
  unit: string;
  pieces?: number;
  width?: number;
  height?: number;
};
export type Totals = { subtotal: number; tax: number; total: number };
export type Company = {
  name: string;
  legalName: string;
  nit: string;
  address: string;
  city: string;
  phone: string;
  email: string;
};
export type Quote = {
  id: string;
  number: string;
  customer: string;
  phone: string;
  message: string;
  createdAt: string;
  status: "requiere_datos" | "por_revisar" | "finalizada";
  lines: Line[];
  issues: string[];
  revision: number;
  finalizedAt?: string;
  snapshot?: {
    company: Company;
    totals: Totals;
    ivaRate: number;
    validUntil: string;
  };
};
