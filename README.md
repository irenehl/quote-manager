# Bot de cotizaciones · LonaPunto

Consola interna ficticia para solicitudes de imprenta por WhatsApp. El bot lee una lista de precios; Karla resuelve las solicitudes ambiguas y envía la cotización.

## Ejecutar

Node 20.9 o superior. `npm install`, `npm test`, `npm run build`, `npm run start`. Desarrollo: `npm run dev`. Disponible en http://127.0.0.1:43123. `/health` reporta identidad y disponibilidad.

## Demo

Seleccionar Rosa y enviar. Abrir Don Chepe y armar con la lista. Corregir la medida de Tienda Don Toño. Editar un precio y ver las solicitudes pendientes recalculadas. Abrir el documento y usar Imprimir → Guardar como PDF.

## Límites

Store en memoria de un único proceso; reiniciar restaura la semilla. No hay API de Meta ni envío real por WhatsApp, email, login, stock, historial de catálogo, pagos, CRM ni LLM. La fila PDF representa un envío simulado y abre el HTML imprimible; no se genera PDF en servidor. El NIT es ficticio y la cotización no es crédito fiscal.

Reconstrucción desde el adjunto del usuario. El repo Cursor y los documentos originales mencionados no estaban presentes; no se afirma haberlos leído ni haber visto inboxes de negocios reales. No existe remote GitHub configurado.
