"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  Plus,
  ArrowUpRight,
  ArrowLeft,
  Check,
  FileText,
  MessageCircle,
  SlidersHorizontal,
  Trash2,
  X,
  ChevronRight,
  Inbox,
  CircleAlert,
} from "lucide-react";
import { CatalogItem, Line, Quote } from "@/lib/types";
import { act } from "@/app/actions";
import { formatPen, totals } from "@/lib/money";
import { formatLimaTime } from "@/lib/dates";
import { QuoteDocument } from "./quote-document";
import { PriceList } from "./price-list";
const labels = {
  requiere_datos: "Faltan datos",
  por_revisar: "Por revisar",
  finalizada: "Finalizada",
};
function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("");
}
function NewRequest({
  close,
  onCreated,
}: {
  close: () => void;
  onCreated: (id: string) => void;
}) {
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <dialog
        ref={dialog}
        className="modal"
        aria-labelledby="new-title"
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
        }}
      >
        <div className="modal-heading">
          <span className="section-eyebrow">DEL MENSAJE AL DOCUMENTO</span>
          <button onClick={close} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        <h2 id="new-title">Pega el pedido. Así de simple.</h2>
        <p>
          Copia el mensaje completo de WhatsApp. Separaremos los productos,
          cantidades y medidas para que los revises.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            start(async () => {
              const r = await act({
                type: "create",
                message: String(data.get("message")),
              });
              if (r.ok && r.id) onCreated(r.id);
              else setError(r.error!);
            });
          }}
        >
          <label>
            Mensaje de WhatsApp
            <textarea
              name="message"
              autoFocus
              required
              maxLength={5000}
              rows={8}
              placeholder={
                "Hola, me llamo Ana López. Necesito 3 lonas de 2x1 metros para mi negocio. Mi teléfono es +503 7000-1234."
              }
            />
          </label>
          <p className="intake-note">
            Si el nombre o teléfono aparecen en el texto, los recuperamos. Si
            no, puedes preparar el pedido igualmente. Las fotos no se incluyen
            al copiar texto.
          </p>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="primary full" disabled={pending}>
            {pending ? "Preparando…" : "Preparar cotización"}
            <ArrowUpRight size={17} />
          </button>
        </form>
      </dialog>
    </div>
  );
}
function LineEditor({
  quote,
  catalog,
  onClose,
}: {
  quote: Quote;
  catalog: CatalogItem[];
  onClose: () => void;
}) {
  const [lines, setLines] = useState<Line[]>(structuredClone(quote.lines));
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const [revision] = useState(quote.revision);
  const change = (index: number, patch: Partial<Line>) =>
    setLines((all) =>
      all.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    );
  return (
    <form
      className="line-editor"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await act({ type: "save", id: quote.id, lines, revision });
          if (r.ok) onClose();
          else setError(r.error!);
        });
      }}
    >
      <h3>Revisar productos</h3>
      <p>Confirma que todos los productos del mensaje estén incluidos.</p>
      {lines.map((line, index) => {
        const item = catalog.find((i) => i.sku === line.sku)!;
        return (
          <fieldset key={index}>
            <div className="line-editor-top">
              <label>
                Producto
                <select
                  value={line.sku}
                  onChange={(e) => {
                    const next = catalog.find((i) => i.sku === e.target.value)!;
                    change(index, {
                      ...next,
                      quantity: 0,
                      pieces: 1,
                      width: undefined,
                      height: undefined,
                    });
                  }}
                >
                  {catalog.map((i) => (
                    <option key={i.sku} value={i.sku}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="remove-line"
                aria-label={`Quitar producto ${index + 1}`}
                onClick={() =>
                  setLines((all) => all.filter((_, i) => i !== index))
                }
              >
                <Trash2 size={16} />
              </button>
            </div>
            {item.qtyMode === "area" ? (
              <div className="dimensions">
                {(["pieces", "width", "height"] as const).map((key, i) => (
                  <label key={key}>
                    {["Piezas", "Ancho (m)", "Alto (m)"][i]}
                    <input
                      type="number"
                      min={key === "pieces" ? 1 : 0.001}
                      step={key === "pieces" ? 1 : "any"}
                      required
                      value={line[key] || ""}
                      onChange={(e) =>
                        change(index, { [key]: Number(e.target.value) })
                      }
                    />
                  </label>
                ))}
              </div>
            ) : (
              <label>
                Cantidad (
                {item.unit === "millar"
                  ? "millares"
                  : item.unit === "paquete 50"
                    ? "paquetes de 50"
                    : item.unit}
                )
                <input
                  type="number"
                  required
                  min={item.qtyMode === "millar" ? 0.001 : 1}
                  step={item.qtyMode === "millar" ? 0.001 : 1}
                  value={line.quantity || ""}
                  onChange={(e) =>
                    change(index, { quantity: Number(e.target.value) })
                  }
                />
                {item.qtyMode === "millar" && (
                  <small>1 millar = 1,000 unidades.</small>
                )}
              </label>
            )}
            <small className="muted">
              {formatPen(item.priceCents)} / {item.unit} · precio de lista
            </small>
          </fieldset>
        );
      })}
      <button
        type="button"
        className="text-button"
        onClick={() => {
          const item = catalog[0];
          setLines((all) => [...all, { ...item, quantity: 0, pieces: 1 }]);
        }}
      >
        <Plus size={15} /> Agregar producto
      </button>
      {error && (
        <p className="error" role="alert">
          {error}{" "}
          {revision !== quote.revision &&
            "Cierra y vuelve a abrir el editor para cargar la versión actual."}
        </p>
      )}
      <div className="editor-actions">
        <button type="button" className="secondary" onClick={onClose}>
          Cancelar
        </button>
        <button className="primary" disabled={pending}>
          {pending ? "Guardando…" : "Guardar revisión"}
          <Check size={16} />
        </button>
      </div>
    </form>
  );
}
function Conversation({
  quote,
  catalog,
}: {
  quote: Quote;
  catalog: CatalogItem[];
}) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const isFinal = quote.status === "finalizada";
  return (
    <>
      <div className="conversation-scroll">
        <div className="conversation-heading">
          <span className="section-eyebrow">PEDIDO ORIGINAL</span>
          <span>{formatLimaTime(quote.createdAt)}</span>
        </div>
        <div className="message-source">
          <MessageCircle size={16} />
          <strong>Cliente</strong>
          <span>WhatsApp</span>
        </div>
        <div className="customer-message">{quote.message}</div>
        <div className="bot-message">
          <div className="bot-heading">
            <span className="bot-icon">✳</span>
            <strong>Bot de cotizaciones</strong>
            <span className="auto-label">Mensaje automático</span>
          </div>
          <p>
            {quote.issues.length
              ? "El bot te pasa esta conversación. Hay datos por completar antes de preparar el documento."
              : `Preparé ${quote.lines.length === 1 ? "un producto" : `${quote.lines.length} productos`} con la lista de precios. Revisa las cantidades y el pedido completo.`}
          </p>
          {quote.issues.length > 0 && (
            <ul className="issues">
              {quote.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          )}
        </div>
        {editing ? (
          <LineEditor
            quote={quote}
            catalog={catalog}
            onClose={() => setEditing(false)}
          />
        ) : (
          <section className="products-summary">
            <div className="summary-heading">
              <h3>
                {isFinal ? "Productos cotizados" : "Productos identificados"}
              </h3>
              {!isFinal && (
                <button
                  className="text-button"
                  onClick={() => setEditing(true)}
                >
                  <SlidersHorizontal size={14} /> Editar
                </button>
              )}
            </div>
            {quote.lines.length ? (
              quote.lines.map((line, index) => (
                <div className="summary-line" key={index}>
                  <span className="line-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <strong>{line.name}</strong>
                    <span>
                      {line.quantity > 0
                        ? `${new Intl.NumberFormat("en-US").format(line.unit === "millar" ? line.quantity * 1000 : line.quantity)} ${line.unit === "millar" ? "unidades" : line.unit}`
                        : "Medidas o cantidad pendientes"}
                    </span>
                  </div>
                  <b>
                    {line.quantity > 0
                      ? formatPen(Math.round(line.quantity * line.priceCents))
                      : "—"}
                  </b>
                </div>
              ))
            ) : (
              <div className="empty-products">
                <CircleAlert size={20} />
                <p>Este pedido necesita tu ayuda.</p>
                <button className="secondary" onClick={() => setEditing(true)}>
                  Armar con la lista
                  <Plus size={15} />
                </button>
              </div>
            )}
          </section>
        )}
        {isFinal && (
          <a
            className="final-file"
            href={`/cotizacion/${quote.id}`}
            target="_blank"
            rel="noreferrer"
          >
            <FileText size={24} />
            <div>
              <strong>{quote.number}</strong>
              <span>Documento finalizado · listo para imprimir</span>
            </div>
            <ArrowUpRight size={18} />
          </a>
        )}
      </div>
      <footer className="conversation-footer">
        {isFinal ? (
          <>
            <span>
              <Check size={15} /> Cotización finalizada
            </span>
            <a
              className="primary"
              href={`/cotizacion/${quote.id}`}
              target="_blank"
              rel="noreferrer"
            >
              Abrir documento
              <ArrowUpRight size={16} />
            </a>
          </>
        ) : (
          <>
            {quote.issues.length === 0 && (
              <div className="review-totals">
                <span>
                  Subtotal {formatPen(totals(quote.lines).subtotal)} · IVA{" "}
                  {formatPen(totals(quote.lines).tax)}
                </span>
                <div>
                  <strong>Total USD</strong>
                  <b>{formatPen(totals(quote.lines).total)}</b>
                </div>
                <a
                  href={`/cotizacion/${quote.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver borrador del documento <ArrowUpRight size={13} />
                </a>
              </div>
            )}
            <p>
              Revisa el pedido antes de finalizar.
              <br />
              <span>El documento se entrega manualmente al cliente.</span>
            </p>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button
              className="primary full"
              disabled={pending || editing || quote.issues.length > 0}
              onClick={() =>
                start(async () => {
                  setError("");
                  const r = await act({
                    type: "finalize",
                    id: quote.id,
                    revision: quote.revision,
                  });
                  if (!r.ok) setError(r.error!);
                })
              }
            >
              {pending ? "Finalizando…" : "Finalizar cotización"}
              <Check size={17} />
            </button>
          </>
        )}
      </footer>
    </>
  );
}
export function Desk({
  quotes,
  catalog,
}: {
  quotes: Quote[];
  catalog: CatalogItem[];
}) {
  const [tab, setTab] = useState<"inbox" | "prices">("inbox");
  const [selected, setSelected] = useState(quotes[0]?.id);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [filter, setFilter] = useState("all");
  const [newOpen, setNewOpen] = useState(false);
  const quote = quotes.find((q) => q.id === selected) ?? quotes[0];
  const visible = quotes.filter((q) => filter === "all" || q.status === filter);
  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="/">
          lona<span>punto</span>
          <i>.</i>
        </a>
        <span className="header-divider" />
        <span className="workspace-name">Taller de impresión</span>
        <div className="operator">
          <span className="demo-pill">Demo local</span>
          <span className="avatar operator-avatar">K</span>
          <span>
            Karla<small>Operadora</small>
          </span>
        </div>
      </header>
      <nav className="app-nav">
        <div>
          <button
            className={tab === "inbox" ? "active" : ""}
            onClick={() => setTab("inbox")}
          >
            <Inbox size={17} /> Solicitudes
            <span className="nav-count">{quotes.length}</span>
          </button>
          <button
            className={tab === "prices" ? "active" : ""}
            onClick={() => setTab("prices")}
          >
            <FileText size={17} /> Lista de precios
          </button>
        </div>
        <span className="nav-note">
          <span /> Precios en USD · IVA 13%
        </span>
      </nav>
      {tab === "prices" ? (
        <PriceList catalog={catalog} />
      ) : (
        <>
          <div className="page-heading">
            <div>
              <div className="section-eyebrow">
                MENOS CUENTAS. MÁS IMPRESIONES.
              </div>
              <h1>
                Del pedido al papel<span>.</span>
              </h1>
              <p>El bot prepara. Tú revisas y le das el visto bueno.</p>
            </div>
            <button className="primary" onClick={() => setNewOpen(true)}>
              <Plus size={17} /> Nueva solicitud
            </button>
          </div>
          <main className={"desk-grid " + (mobileDetail ? "show-detail" : "")}>
            <aside className="inbox-panel">
              <div className="inbox-title">
                <h2>Solicitudes</h2>
                <span>{quotes.length.toString().padStart(2, "0")}</span>
              </div>
              <div className="filters">
                {[
                  ["all", "Todas"],
                  ["por_revisar", "Por revisar"],
                  ["requiere_datos", "Faltan datos"],
                  ["finalizada", "Finalizadas"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    className={filter === id ? "active" : ""}
                    onClick={() => setFilter(id)}
                  >
                    {label}
                    {id === "requiere_datos" && (
                      <span>
                        {quotes.filter((q) => q.status === id).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="inbox-list">
                {visible.map((q, i) => (
                  <button
                    key={q.id}
                    className={
                      "inbox-item " + (quote.id === q.id ? "selected" : "")
                    }
                    onClick={() => {
                      setSelected(q.id);
                      setMobileDetail(true);
                    }}
                  >
                    <span className={`avatar tone-${i % 4}`}>
                      {initials(q.customer)}
                    </span>
                    <div className="inbox-content">
                      <div className="inbox-name">
                        <strong>{q.customer}</strong>
                        <span>{formatLimaTime(q.createdAt)}</span>
                      </div>
                      <p>{q.message}</p>
                      <span className={"status " + q.status}>
                        <i />
                        {labels[q.status]}
                      </span>
                    </div>
                    <ChevronRight className="inbox-chevron" size={15} />
                  </button>
                ))}
                {!visible.length && (
                  <div className="empty-filter">
                    <Check size={22} />
                    <p>No hay solicitudes en este estado.</p>
                  </div>
                )}
              </div>
              <div className="inbox-bottom">
                <MessageCircle size={14} /> Pedidos recibidos por WhatsApp
              </div>
            </aside>
            <section className="conversation-panel">
              <header className="detail-header">
                <button
                  className="mobile-back"
                  onClick={() => setMobileDetail(false)}
                  aria-label="Volver a solicitudes"
                >
                  <ArrowLeft size={18} />
                </button>
                <span className="avatar detail-avatar">
                  {initials(quote.customer)}
                </span>
                <div>
                  <h2>{quote.customer}</h2>
                  <span>{quote.phone || "Sin teléfono"} · WhatsApp</span>
                </div>
                <span className={"status " + quote.status}>
                  <i />
                  {labels[quote.status]}
                </span>
              </header>
              <Conversation key={quote.id} quote={quote} catalog={catalog} />
            </section>
            <section className="document-panel">
              <div className="document-panel-heading">
                <span>
                  <FileText size={15} /> VISTA DEL DOCUMENTO
                </span>
                <a
                  href={`/cotizacion/${quote.id}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Abrir documento en otra pestaña"
                >
                  <ArrowUpRight size={18} />
                </a>
              </div>
              <div className="document-preview">
                <QuoteDocument quote={quote} />
              </div>
              <div className="document-panel-foot">
                <span>USD · IVA incluido en el total</span>
                <span>
                  {quote.issues.length
                    ? "Pendiente"
                    : formatPen(totals(quote.lines).total)}
                </span>
              </div>
            </section>
          </main>
        </>
      )}
      {newOpen && (
        <NewRequest
          close={() => setNewOpen(false)}
          onCreated={(id) => {
            setSelected(id);
            setFilter("all");
            setNewOpen(false);
            setMobileDetail(true);
            setTab("inbox");
          }}
        />
      )}
    </div>
  );
}
