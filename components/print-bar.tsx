"use client";
import { Printer, ArrowLeft } from "lucide-react";
export function PrintBar() {
  return (
    <nav className="print-bar">
      <a href="/">
        <ArrowLeft size={16} /> Volver a solicitudes
      </a>
      <button className="primary" onClick={() => window.print()}>
        <Printer size={16} /> Imprimir / guardar PDF
      </button>
    </nav>
  );
}
