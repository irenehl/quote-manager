import { Quote } from "@/lib/types";
import { company } from "@/lib/company";
import { totals, formatPen } from "@/lib/money";
import { formatLimaDate } from "@/lib/dates";
export function QuoteDocument({ quote }: { quote: Quote }) {
  const shop = quote.snapshot?.company ?? company;
  const amount = quote.snapshot?.totals ?? totals(quote.lines);
  const ready = quote.status === "finalizada";
  return (
    <article className="paper" aria-label="Documento de cotización">
      <div className="paper-top">
        <div className="paper-brand">
          lona<span>punto</span>
          <i>.</i>
        </div>
        <span className="paper-kind">
          COTIZACIÓN
          <br />
          <b>{quote.number}</b>
        </span>
      </div>
      <div className="shop-details">
        {shop.legalName}
        <br />
        {shop.address}
        <br />
        {shop.city}
        <br />
        NIT: {shop.nit}
      </div>
      <div className="paper-rule" />
      <div className="paper-recipient">
        <div>
          <small>PREPARADA PARA</small>
          <h3>{quote.customer}</h3>
          <p>{quote.phone || "Sin teléfono registrado"}</p>
        </div>
        <div>
          <small>FECHA</small>
          <p>{formatLimaDate(quote.finalizedAt ?? quote.createdAt)}</p>
          <span className={"doc-status " + (ready ? "is-final" : "")}>
            {ready ? "Finalizada" : "Borrador"}
          </span>
        </div>
      </div>
      <table className="quote-table">
        <thead>
          <tr>
            <th>DESCRIPCIÓN</th>
            <th>CANT.</th>
            <th>PRECIO</th>
            <th>IMPORTE</th>
          </tr>
        </thead>
        <tbody>
          {quote.lines.map((l, i) => (
            <tr key={i}>
              <td>
                <strong>{l.name}</strong>
                <small>
                  {l.unit}
                  {l.width && l.height
                    ? ` · ${l.pieces} pza. × ${l.width} × ${l.height} m`
                    : ""}
                </small>
              </td>
              <td>
                {l.quantity > 0
                  ? new Intl.NumberFormat("en-US", {
                      maximumFractionDigits: 3,
                    }).format(l.quantity)
                  : "—"}
              </td>
              <td>{formatPen(l.priceCents)}</td>
              <td>
                {l.quantity > 0
                  ? formatPen(Math.round(l.quantity * l.priceCents))
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!quote.lines.length && (
        <p className="paper-empty">
          Los productos aparecerán aquí al completar el pedido.
        </p>
      )}
      {quote.issues.length > 0 ? (
        <div className="document-warning">
          Cotización incompleta · pendiente de revisión
        </div>
      ) : (
        <div className="paper-totals">
          <div>
            <span>Subtotal</span>
            <span>{formatPen(amount.subtotal)}</span>
          </div>
          <div>
            <span>
              IVA {Math.round((quote.snapshot?.ivaRate ?? 0.13) * 100)}%
            </span>
            <span>{formatPen(amount.tax)}</span>
          </div>
          <div className="grand-total">
            <span>Total USD</span>
            <strong>{formatPen(amount.total)}</strong>
          </div>
        </div>
      )}
      <div className="paper-bottom">
        <strong>Gracias por darle forma a tus ideas con nosotros.</strong>
        <p>
          {ready
            ? `Válida hasta el ${formatLimaDate(quote.snapshot!.validUntil)}.`
            : "Validez: 7 días a partir de su finalización."}{" "}
          Precios expresados en dólares estadounidenses.
        </p>
        <p>
          {shop.phone} · {shop.email}
        </p>
        <small>
          Documento de cotización. No constituye crédito fiscal.
          <br />
          Negocio y NIT ficticios para demostración.
        </small>
      </div>
    </article>
  );
}
