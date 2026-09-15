"use client";
import { useState, useTransition } from "react";
import { CatalogItem } from "@/lib/types";
import { act } from "@/app/actions";
import { formatPen } from "@/lib/money";
import { Pencil, Check, X } from "lucide-react";
function PriceRow({ item }: { item: CatalogItem }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  return (
    <tr>
      <td>
        <span className="sku">{item.sku}</span>
      </td>
      <td>
        <strong>{item.name}</strong>
      </td>
      <td>{item.unit}</td>
      <td>
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                if (!/^\d+(\.\d{1,2})?$/.test(value)) {
                  setError("Usa hasta 2 decimales.");
                  return;
                }
                const result = await act({
                  type: "price",
                  sku: item.sku,
                  priceCents: Math.round(Number(value) * 100),
                });
                if (result.ok) {
                  setEditing(false);
                  setError("");
                } else setError(result.error!);
              });
            }}
          >
            <div className="price-input">
              <span>$</span>
              <input
                aria-label={`Precio de ${item.name}`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                inputMode="decimal"
                autoFocus
                required
              />
              <button disabled={pending} aria-label="Guardar precio">
                <Check size={16} />
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                aria-label="Cancelar"
              >
                <X size={16} />
              </button>
            </div>
            {error && (
              <small role="alert" className="error">
                {error}
              </small>
            )}
          </form>
        ) : (
          <button
            className="edit-price"
            onClick={() => {
              setValue((item.priceCents / 100).toFixed(2));
              setEditing(true);
            }}
          >
            {formatPen(item.priceCents)}
            <Pencil size={13} />
          </button>
        )}
      </td>
    </tr>
  );
}
export function PriceList({ catalog }: { catalog: CatalogItem[] }) {
  return (
    <main className="catalog-page">
      <div className="section-eyebrow">LA BASE DE CADA COTIZACIÓN</div>
      <h1>
        Lista de precios<span>.</span>
      </h1>
      <p>
        Un solo precio de referencia. Los cambios se aplican a los borradores
        abiertos.
      </p>
      <div className="catalog-caption">
        <span>{catalog.length} productos</span>
        <span>USD · precios antes de IVA</span>
      </div>
      <div className="table-scroll">
        <table className="catalog-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>PRODUCTO</th>
              <th>UNIDAD</th>
              <th>PRECIO UNITARIO</th>
            </tr>
          </thead>
          <tbody>
            {catalog.map((item) => (
              <PriceRow key={item.sku} item={item} />
            ))}
          </tbody>
        </table>
      </div>
      <p className="catalog-footnote">
        Las cotizaciones finalizadas conservan sus precios originales.
      </p>
    </main>
  );
}
