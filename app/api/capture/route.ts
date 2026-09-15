import { readCapture, readLimitedBody, VisionError } from "@/lib/vision";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Single-operator local demo: one provider request at a time, no automatic retry.
let busy = false;
export function GET() {
  return Response.json(
    { configured: Boolean(process.env.OPENAI_API_KEY) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(request: Request) {
  const url = new URL(request.url);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
    return Response.json(
      {
        error:
          "La lectura de capturas está disponible solo desde la demo local.",
      },
      { status: 403 },
    );
  if (request.headers.get("origin") !== url.origin)
    return Response.json({ error: "Origen no permitido." }, { status: 403 });
  if (!process.env.OPENAI_API_KEY)
    return Response.json(
      {
        error:
          "La lectura de capturas aún no está configurada. Puedes pegar el texto.",
      },
      { status: 503 },
    );
  if (busy)
    return Response.json(
      { error: "Hay otra captura en lectura. Espera un momento." },
      { status: 429 },
    );
  busy = true;
  try {
    const bytes = await readLimitedBody(request);
    const reading = await readCapture(bytes, {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_VISION_MODEL,
    });
    return Response.json(reading, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const timeout =
      e instanceof Error && ["TimeoutError", "AbortError"].includes(e.name);
    return Response.json(
      {
        error: timeout
          ? "La lectura tardó demasiado. Intenta otra captura o pega el texto."
          : e instanceof VisionError
            ? e.message
            : "No pudimos conectar con el lector. Intenta de nuevo o pega el texto.",
      },
      { status: timeout ? 504 : e instanceof VisionError ? e.status : 502 },
    );
  } finally {
    busy = false;
  }
}
