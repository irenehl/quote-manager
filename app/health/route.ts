export function GET() {
  return Response.json({
    ok: true,
    name: "cotizador-whatsapp",
    shop: "LonaPunto",
    country: "SV",
    currency: "USD",
  });
}
