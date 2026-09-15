import type { Metadata } from "next";
import "./globals.css";
import "./workspace.css";
export const metadata: Metadata = {
  title: "LonaPunto · Cotizaciones",
  description: "Del pedido a una cotización lista para entregar.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
