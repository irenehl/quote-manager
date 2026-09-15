import { captureOriginAllowed } from "@/lib/capture-origin";
import { readCapture, readLimitedBody, VisionError } from "@/lib/vision";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// One provider request per process at a time, with no automatic retry.
let busy = false;

export function GET() {
  return Response.json(
    { configured: Boolean(process.env.OPENAI_API_KEY) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  let stage = "origin";

  function respond(status: number, reason: string, data: object) {
    // Never log headers, credentials, image bytes, extracted text or raw errors.
    console.info("capture.request", {
      requestId,
      status,
      reason,
      stage,
      configured: Boolean(process.env.OPENAI_API_KEY),
      elapsedMs: Date.now() - startedAt,
    });
    return Response.json(
      { ...data, requestId },
      { status, headers: { "Cache-Control": "no-store", "X-Request-Id": requestId } },
    );
  }

  if (!captureOriginAllowed(request)) {
    return respond(403, "origin_rejected", {
      error: "Este origen no está autorizado para leer capturas.",
    });
  }
  stage = "configuration";
  if (!process.env.OPENAI_API_KEY) {
    return respond(503, "key_missing", {
      error: "La lectura de capturas aún no está configurada. Puedes pegar el texto.",
    });
  }
  if (busy) {
    return respond(429, "reader_busy", {
      error: "Hay otra captura en lectura. Espera un momento.",
    });
  }
  busy = true;
  try {
    stage = "body";
    const bytes = await readLimitedBody(request);
    stage = "reading";
    const reading = await readCapture(bytes, {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_VISION_MODEL,
    });
    return respond(200, "completed", reading);
  } catch (error) {
    const timeout = error instanceof Error &&
      ["TimeoutError", "AbortError"].includes(error.name);
    const status = timeout ? 504 : error instanceof VisionError ? error.status : 502;
    return respond(status, timeout ? "timeout" : error instanceof VisionError ? error.code : "connection_or_response_error", {
      error: timeout
        ? "La lectura tardó demasiado. Intenta otra captura o pega el texto."
        : error instanceof VisionError
          ? error.message
          : "No pudimos conectar con el lector. Intenta de nuevo o pega el texto.",
    });
  } finally {
    busy = false;
  }
}
