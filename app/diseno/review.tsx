"use client";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  FileText,
  Inbox,
  MessageSquare,
  Printer,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import styles from "./review.module.css";
import { formatPen } from "@/lib/money";

export function DesignReview() {
  const [variant, setVariant] = useState<"a" | "b">("a");
  const [pieces, setPieces] = useState("3");
  const [width, setWidth] = useState("2");
  const [height, setHeight] = useState("1");
  const [finalized, setFinalized] = useState(false);
  const [document, setDocument] = useState(false);
  const area = Number(pieces) * Number(width) * Number(height);
  const valid =
    Number.isInteger(Number(pieces)) &&
    Number(pieces) > 0 &&
    Number(width) > 0 &&
    Number(height) > 0 &&
    Number.isFinite(area) &&
    area <= 1000000;
  const subtotal = valid ? Math.round(area * 1800) : 0;
  const iva = Math.round(subtotal * 0.13);
  function change(setter: (v: string) => void, value: string) {
    setter(value);
    setFinalized(false);
  }
  return (
    <div className={`${styles.lab} ${variant === "b" ? styles.workshop : ""}`}>
      <div className={styles.labbar}>
        <a href="/">
          <ArrowLeft size={16} /> Volver a la app
        </a>
        <span>Exploración de diseño · datos de ejemplo</span>
        <div role="group" aria-label="Variante de diseño">
          <button
            aria-pressed={variant === "a"}
            onClick={() => setVariant("a")}
          >
            A · Mesa de trabajo
          </button>
          <button
            aria-pressed={variant === "b"}
            onClick={() => setVariant("b")}
          >
            B · Orden de taller
          </button>
        </div>
      </div>
      <div className={styles.app}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <span className={styles.brandmark}>
              <Printer size={22} />
            </span>
            <strong>
              LonaPunto<span> / cotizaciones</span>
            </strong>
          </div>
          <span className={styles.shop}>Soyapango, San Salvador</span>
          <div className={styles.person}>
            <span>K</span>
            <strong>Karla</strong>
          </div>
        </header>
        <div className={styles.workspace}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarLabel}>ESPACIO DE TRABAJO</div>
            <div className={styles.navselected}>
              <Inbox size={18} /> Solicitudes <span>8</span>
            </div>
            <a href="/">
              <SlidersHorizontal size={18} /> Abrir app completa{" "}
              <ArrowUpRight size={14} />
            </a>
            <div className={styles.listHeading}>
              Por revisar <span>6</span>
            </div>
            <div className={styles.selectedRequest}>
              <div>
                <span className={styles.avatar}>RR</span>
                <strong>Rosa Recinos</strong>
              </div>
              <p>3 lonas · 2 × 1 m</p>
              <span className={styles.requestStatus}>
                En revisión <ChevronRight size={14} />
              </span>
            </div>
            <div className={styles.request}>
              <strong>Diego Martínez</strong>
              <p>1,000 tarjetas de presentación</p>
            </div>
            <div className={styles.request}>
              <strong>Lucía Sorto</strong>
              <p>2,000 volantes A5</p>
            </div>
            <div className={styles.listHeading}>
              Faltan datos <span>2</span>
            </div>
            <div className={styles.request}>
              <strong>Don Chepe</strong>
              <p>Producto por confirmar</p>
              <span className={styles.missing}>Requiere tu ayuda</span>
            </div>
            <div className={styles.sidebarFoot}>
              Solo Rosa es interactiva en esta prueba.
            </div>
          </aside>
          <main className={styles.main}>
            <div className={styles.breadcrumb}>
              Solicitudes <ChevronRight size={14} /> <span>COT-2609-001</span>
            </div>
            <div className={styles.titleRow}>
              <div>
                <div className={styles.kicker}>
                  {variant === "a"
                    ? "REVISIÓN DE COTIZACIÓN"
                    : "ORDEN DE TRABAJO / 001"}
                </div>
                <h1>
                  {variant === "a" ? "Rosa Recinos" : "Vamos con las lonas."}
                </h1>
                <p>
                  {variant === "a"
                    ? "+503 7000-1101 · Recibido por WhatsApp"
                    : "Rosa Recinos · +503 7000-1101"}
                </p>
              </div>
              <span className={styles.status}>
                <span />
                {finalized ? "Finalizada" : "Por revisar"}
              </span>
            </div>
            <div className={styles.content}>
              <section className={styles.message}>
                <div className={styles.sectionTitle}>
                  <MessageSquare size={18} />
                  <h2>Lo que pidió Rosa</h2>
                  <span>09:41</span>
                </div>
                <blockquote>
                  Hola, buenos días. Necesito <strong>3 lonas de 2×1</strong>{" "}
                  para mi negocio. ¿Cuánto me sale?
                </blockquote>
                <div className={styles.messageMeta}>
                  <Check size={16} /> Producto y medidas identificados
                </div>
                <p className={styles.messageHelp}>
                  Compara el mensaje con los datos del pedido. Puedes
                  corregirlos aquí mismo.
                </p>
              </section>
              <section className={styles.order}>
                <div className={styles.orderHeading}>
                  <div className={styles.sectionTitle}>
                    <span className={styles.step}>01</span>
                    <h2>Detalle del pedido</h2>
                  </div>
                  <span>1 producto</span>
                </div>
                <div className={styles.product}>
                  <div className={styles.material}>
                    <span />
                    <span />
                    <span />
                  </div>
                  <div>
                    <h3>Lona publicitaria 13oz</h3>
                    <p>
                      LONA-13 <span>·</span> Precio de lista:{" "}
                      <strong>$18.00 / m²</strong>
                    </p>
                  </div>
                </div>
                <div className={styles.measurements}>
                  {[
                    {
                      label: "Piezas",
                      value: pieces,
                      set: setPieces,
                      min: "1",
                      step: "1",
                    },
                    {
                      label: "Ancho (m)",
                      value: width,
                      set: setWidth,
                      min: ".001",
                      step: "any",
                    },
                    {
                      label: "Alto (m)",
                      value: height,
                      set: setHeight,
                      min: ".001",
                      step: "any",
                    },
                  ].map((f) => (
                    <label key={f.label}>
                      {f.label}
                      <input
                        type="number"
                        min={f.min}
                        step={f.step}
                        value={f.value}
                        disabled={finalized}
                        onChange={(e) => change(f.set, e.target.value)}
                      />
                    </label>
                  ))}
                  <div className={styles.area}>
                    <span>Área total</span>
                    <strong>
                      {valid
                        ? new Intl.NumberFormat("es-SV", {
                            maximumFractionDigits: 3,
                          }).format(area)
                        : "—"}{" "}
                      <small>m²</small>
                    </strong>
                  </div>
                </div>
                {!valid && (
                  <p role="alert" className={styles.error}>
                    Revisa las medidas. Usa valores positivos y piezas enteras.
                  </p>
                )}
                <div className={styles.formula}>
                  <span>
                    {valid
                      ? `${pieces} piezas × ${width} m × ${height} m × $18.00`
                      : "Completa las medidas para calcular"}
                  </span>
                  <strong>{formatPen(subtotal)}</strong>
                </div>
                <div className={styles.orderNote}>
                  <Check size={16} />
                  <p>
                    Precio tomado de la lista del taller.
                    <br />
                    <span>Las medidas se calculan en metros.</span>
                  </p>
                </div>
              </section>
              <section className={styles.summary}>
                <div className={styles.sectionTitle}>
                  <span className={styles.step}>02</span>
                  <h2>La cotización</h2>
                </div>
                <dl>
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{formatPen(subtotal)}</dd>
                  </div>
                  <div>
                    <dt>IVA · 13%</dt>
                    <dd>{formatPen(iva)}</dd>
                  </div>
                  <div className={styles.total}>
                    <dt>
                      Total <span>USD</span>
                    </dt>
                    <dd>{formatPen(subtotal + iva)}</dd>
                  </div>
                </dl>
                <div className={styles.validity}>
                  Válida por 7 días desde su finalización.
                </div>
                <button
                  className={styles.finalize}
                  disabled={!valid || finalized}
                  onClick={() => setFinalized(true)}
                >
                  {finalized ? (
                    <>
                      <Check size={18} /> Finalizada en esta prueba
                    </>
                  ) : (
                    <>
                      Finalizar cotización <ArrowUpRight size={18} />
                    </>
                  )}
                </button>
                <button
                  className={styles.previewButton}
                  onClick={() => setDocument(!document)}
                >
                  <FileText size={17} />
                  {document ? "Ocultar documento" : "Ver documento"}
                </button>
                <p className={styles.handoff}>
                  Revisa, guarda y entrega el documento al cliente.
                </p>
                {finalized && (
                  <button
                    className={styles.reset}
                    onClick={() => setFinalized(false)}
                  >
                    <RotateCcw size={15} /> Volver a editar
                  </button>
                )}
              </section>
            </div>
            {document && (
              <section
                className={styles.document}
                aria-label="Vista del documento"
              >
                <div>
                  <strong>LonaPunto</strong>
                  <span>
                    COT-2609-001 · {finalized ? "Finalizada" : "Borrador"}
                  </span>
                </div>
                <h2>Cotización para Rosa Recinos</h2>
                <p>
                  Lona publicitaria 13oz · {valid ? area : "—"} m² · $18.00 / m²
                </p>
                <div>
                  <span>
                    Subtotal {formatPen(subtotal)} + IVA {formatPen(iva)}
                  </span>
                  <strong>{formatPen(subtotal + iva)}</strong>
                </div>
                <small>
                  Vista de diseño. No guarda ni modifica las cotizaciones de la
                  app.
                </small>
              </section>
            )}
            <footer className={styles.footer}>
              <span>LonaPunto, S.A. de C.V.</span>
              <span>Lista en USD · entrega manual</span>
            </footer>
          </main>
        </div>
      </div>
      <div className={styles.designNote}>
        <strong>
          {variant === "a" ? "A / Mesa de trabajo" : "B / Orden de taller"}
        </strong>
        <p>
          {variant === "a"
            ? "Source Sans 3, azul tinta y una distribución compacta. El mensaje abre el trabajo; la revisión y el total comparten la fila siguiente."
            : "Lexend + Source Sans 3, grafito y amarillo. El mensaje permanece al lado de una orden amplia; el cierre se dispone debajo del detalle."}
        </p>
        <span>
          Puedes cambiar medidas, abrir el documento y probar la finalización.
          Nada se guarda.
        </span>
      </div>
    </div>
  );
}
