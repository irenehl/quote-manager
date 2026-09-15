# Bot de cotizaciones · LonaPunto

Herramienta interna para Karla, operadora de una imprenta ficticia en Soyapango. Convierte pedidos pegados desde WhatsApp en cotizaciones revisadas e imprimibles. Opción A del challenge AdoptAI: reducir interpretación y cálculo manual sin automatizar decisiones que necesitan contexto.

## Ejecutar

Node 20.9 o superior. `npm install`, `npm test`, `npm run build`, `npm run start`. Desarrollo: `npm run dev`. Disponible en http://127.0.0.1:43123. `/health` reporta identidad y disponibilidad.

## Demo

1. Seleccionar Rosa: 3 lonas de 2×1 m → 6 m² → $108.00 + $14.04 IVA = $122.04.
2. Crear una solicitud pegando únicamente «Necesito vinil para la vitrina». El contacto queda como «Cliente por identificar» si no aparece en el texto. Finalizar queda bloqueado hasta resolver medidas.
3. Editar: 2 piezas, ancho 2 m y alto 1 m. Guardar revisión → 4 m² → $99.44 con IVA.
4. Finalizar y abrir el documento. Imprimir → Guardar como PDF; entregar manualmente al cliente.
5. Editar un precio en Lista de precios. Los borradores cambian, las finalizadas conservan sus importes. Para demostrar concurrencia, dejar Rosa abierta en una pestaña y cambiar LONA-13 en otra: el primer intento de finalizar exige revisar el nuevo total.

## Decisiones y arquitectura

La entrada es un único mensaje: recupera nombre y teléfono cuando aparecen explícitamente (etiquetas, «me llamo» o encabezado de WhatsApp). Conserva el texto original y permite preparar sin identidad. No interpreta fotos ni identifica automáticamente a cada participante de una conversación larga.

- Next.js App Router y server actions para mantener UI, validación y operaciones en un solo proyecto. React y CSS/Tailwind, con iconos Lucide y controles nativos. No se añadió shadcn ni un servicio externo para este alcance.
- `lib/match.ts`: reglas de alias, cantidad a la izquierda, piezas × ancho × alto, millares y paquetes de 50. Repeticiones del mismo producto conservan líneas distintas. El parser prepara; Karla revisa siempre.
- `lib/store.ts`: memoria compartida por el proceso, estados `requiere_datos`, `por_revisar`, `finalizada`. Cada actualización incrementa una revisión; las operaciones rechazan revisiones antiguas.
- `lib/quote.ts` y `lib/money.ts`: los precios se resuelven desde el catálogo en servidor; céntimos enteros, redondeo por línea e IVA sobre subtotal. Al finalizar se guardan líneas, datos del negocio, tasa, totales y validez de 7 días.
- Edición de precios únicamente. La revisión manual admite agregar/quitar productos del pedido y corregir medidas/cantidades. Los cambios del catálogo no borran las correcciones.
- El HTML de `/cotizacion/[id]` sirve tanto para borradores identificados como tales como para documentos finalizados. El botón de impresión usa el navegador; los datos siguen en memoria hasta reiniciar.

## Validación

`npm test` ejecuta pruebas de cantidades, medidas, unidades, redondeo, precios no confiables, excepciones, revisiones antiguas e inmutabilidad de documentos finalizados. `npm run build` verifica compilación y TypeScript.

Se comprobó en navegador: pedido nuevo sin teléfono, bloqueo por medidas, corrección, finalización, documento, precio editado en otra pestaña y rechazo de revisión antigua. Bandeja y navegación de detalle revisadas a 375 px, sin desbordamiento horizontal.

El navegador integrado permitió inspeccionar el documento y activar Imprimir, pero no expuso un diálogo de impresión verificable. La exportación final a un archivo PDF debe comprobarse desde el navegador habitual; no se afirma haber generado o inspeccionado ese archivo.

## Límites

Store en memoria de un único proceso; reiniciar restaura la semilla y pierde pedidos creados, cambios y finalizaciones. No es apto para despliegue con múltiples procesos ni operación real. Las pestañas no reciben cambios en tiempo real; el servidor comprueba la revisión al guardar/finalizar.

No hay API de Meta, envío simulado, email, login, stock, historial de catálogo, pagos, CRM ni LLM. El pedido se pega manualmente y la cotización se entrega manualmente. No se genera PDF en servidor. El NIT es ficticio y la cotización no es crédito fiscal.

El parser entiende patrones acotados, no lenguaje natural general: detecta algunas cláusulas adicionales desconocidas, pero puede omitir pedidos implícitos, negaciones o nombres ambiguos. Formatos no reconocidos requieren edición. «2,5» se interpreta como decimal; para miles usar `2000` o `2 mil`, no `2,000`. Medidas sin unidad se interpretan en metros; se admite `200x100 cm`. Una medida sin número de piezas asume una pieza y queda visible para revisión. No se infieren acabados, diseño, descuentos ni entrega. No afirmar que funciona con cualquier mensaje.

Reconstrucción desde el adjunto del usuario. El repo Cursor y los documentos originales mencionados no estaban presentes; no se afirma haberlos leído ni haber visto inboxes de negocios reales. No existe remote GitHub configurado.

## Una semana más

Validar con una operadora mensajes reales anonimizados y reglas de unidades/acabados; después persistencia con transacciones y copias de seguridad, autenticación y pruebas del flujo completo. Con ese núcleo validado, integrar recepción de WhatsApp y entrega de documentos con reintentos e idempotencia. No automatizar envíos antes de medir errores de interpretación.

## Tiempo y procedencia

Trabajo nuevo en este workspace. El primer commit es del 14 de septiembre de 2026 a las 18:31 (El Salvador); implementación funcional registrada a las 22:05 y verificación/cierre después. Son marcas de tiempo de pared, con conversación y pausas entre ellas, no horas continuas de trabajo. No hubo cronómetro desde el inicio: no se acredita un total exacto ni cumplimiento de cinco horas. Ver `TIMELOG.md` y `AI.md` para el registro y las correcciones de alcance.
