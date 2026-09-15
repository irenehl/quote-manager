"use client";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, ScanText, X, LoaderCircle } from "lucide-react";
type Reading = { message: string; warnings: string[] };
export function CaptureInput({
  onRead,
  onReset,
}: {
  onRead: (reading: Reading) => void;
  onReset: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [read, setRead] = useState(false);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/capture", { signal: controller.signal })
      .then((r) => r.json())
      .then((r) => setConfigured(r.configured === true))
      .catch(() => {});
    return () => {
      controller.abort();
      abort.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  function choose(next: File | undefined) {
    if (loading) return;
    setError("");
    if (!next) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(next.type) ||
      next.size === 0 ||
      next.size > 4 * 1024 * 1024
    ) {
      setError("Selecciona una captura PNG, JPG o WebP de hasta 4 MB.");
      return;
    }
    setFile(next);
    setRead(false);
    onReset();
  }
  async function extract() {
    if (!file || loading) return;
    setError("");
    setLoading(true);
    const controller = new AbortController();
    abort.current = controller;
    const timer = setTimeout(() => controller.abort(), 40000);
    try {
      const response = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          `${data.error || "No se pudo leer la captura."}${data.requestId ? ` Referencia: ${data.requestId}` : ""}`,
        );
      onRead(data);
      setRead(true);
    } catch (e) {
      if (!controller.signal.aborted)
        setError(
          e instanceof Error ? e.message : "No se pudo leer la captura.",
        );
      else
        setError(
          "Lectura cancelada o tiempo de espera agotado. Puedes intentarlo de nuevo.",
        );
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }
  return (
    <section
      className="capture-input"
      aria-label="Captura de WhatsApp"
      onPaste={(e) => {
        const image = [...e.clipboardData.files].find((f) =>
          f.type.startsWith("image/"),
        );
        if (image) {
          e.preventDefault();
          choose(image);
        }
      }}
    >
      <label
        className="capture-drop"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          choose(e.dataTransfer.files[0]);
        }}
      >
        <ImagePlus size={24} />
        <strong>
          {file ? "Cambiar captura" : "Sube o arrastra una captura"}
        </strong>
        <span>PNG, JPG o WebP · hasta 4 MB</span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={loading}
          onChange={(e) => {
            choose(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      {preview && (
        <div className="capture-preview">
          <img
            src={preview}
            alt="Captura seleccionada para revisar el pedido"
          />
          <button
            type="button"
            className="secondary"
            disabled={loading}
            onClick={() => {
              setFile(null);
              setRead(false);
              setError("");
              onReset();
            }}
          >
            <X size={14} /> Quitar captura
          </button>
        </div>
      )}
      <p className="intake-note">
        Al pulsar “Leer captura”, enviarás esta imagen y el texto que contiene a
        OpenAI. Recorta datos ajenos al pedido. La app no guarda la imagen.
      </p>
      {configured === false && (
        <p className="capture-notice" role="status">
          La lectura de capturas aún no está configurada. Mientras tanto, puedes
          usar “Pegar texto”.
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button
        type="button"
        className="secondary full"
        disabled={!file || loading || configured === false || read}
        onClick={extract}
      >
        {loading ? (
          <LoaderCircle size={16} className="spin" />
        ) : (
          <ScanText size={16} />
        )}{" "}
        {loading
          ? "Leyendo captura…"
          : read
            ? "Texto extraído · revísalo abajo"
            : "Leer captura"}
      </button>
      {loading && (
        <button
          type="button"
          className="text-button"
          onClick={() => abort.current?.abort()}
        >
          Cancelar lectura
        </button>
      )}
    </section>
  );
}
