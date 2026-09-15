# Cotizador LonaPunto

Herramienta interna para Karla, operadora de una imprenta ficticia en Soyapango. Convierte pedidos pegados desde WhatsApp en cotizaciones revisadas e imprimibles. Opción A del challenge AdoptAI: reducir interpretación y cálculo manual sin automatizar decisiones que necesitan contexto.

## Ejecutar

Node 20.9 o superior. `npm install`, `npm test`, `npm run build`, `npm run start`. Desarrollo: `npm run dev`. Disponible en http://127.0.0.1:43123. `/health` reporta identidad y disponibilidad.

En entornos que prohíben los puertos internos de Turbopack, usar `npm run build -- --webpack`. La última iteración se verificó con esa alternativa.

## Demo

1. Seleccionar Rosa: 3 lonas de 2×1 m → 6 m² → $108.00 + $14.04 IVA = $122.04.
2. Crear una solicitud pegando únicamente «Necesito vinil para la vitrina». El contacto queda como «Cliente por identificar» si no aparece en el texto. Finalizar queda bloqueado hasta resolver medidas.
3. Editar: 2 piezas, ancho 2 m y alto 1 m. Guardar revisión → 4 m² → $99.44 con IVA.
4. Finalizar y abrir el documento. Imprimir → Guardar como PDF; entregar manualmente al cliente.
5. Editar un precio en Lista de precios. Los borradores cambian, las finalizadas conservan sus importes. Para demostrar concurrencia, dejar Rosa abierta en una pestaña y cambiar LONA-13 en otra: el primer intento de finalizar exige revisar el nuevo total.

## Decisiones y arquitectura

La entrada acepta texto o una captura. El texto recupera nombre y teléfono cuando aparecen explícitamente (etiquetas, «me llamo» o encabezado de WhatsApp). Permite preparar sin identidad. La captura genera un texto editable que debe compararse con la imagen; no se deducen características de una fotografía del producto.

En la revisión, «Editar cliente» permite corregir nombre y teléfono antes de finalizar. Ambos son opcionales y se reflejan en la bandeja y el documento al guardar. Las cotizaciones finalizadas conservan los datos aprobados.

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

No hay API de Meta, envío simulado, email, login, stock, historial de catálogo, pagos ni CRM. El texto se procesa con reglas; la lectura opcional de capturas usa un modelo con visión. La cotización se entrega manualmente. No se genera PDF en servidor. El NIT es ficticio y la cotización no es crédito fiscal.

## Lectura opcional de capturas

1. Crear `.env.local` usando `.env.example` y configurar `OPENAI_API_KEY` en el servidor. No pegar claves en la UI ni usar variables `NEXT_PUBLIC_`. Reiniciar el servidor.
2. Nueva solicitud → Leer captura → seleccionar PNG/JPG/WebP de hasta 4 MB. La vista previa es local; seleccionar un archivo no lo envía al proveedor.
3. “Leer captura” envía la imagen a OpenAI. Se solicita una lectura estructurada con `gpt-4.1-mini-2025-04-14`, configurable mediante `OPENAI_VISION_MODEL`. El modelo no recibe herramientas ni permisos para cotizar o modificar datos.
4. Revisar/corregir el texto y advertencias contra la imagen, marcar la revisión y preparar el borrador. Los precios continúan saliendo únicamente del catálogo. La imagen se libera al cerrar el formulario; se conserva solo el texto aprobado como pedido.

Implementado con [Responses e imágenes en base64](https://developers.openai.com/api/docs/guides/images-vision) y un [modelo con entrada de imagen y salida estructurada](https://developers.openai.com/api/docs/models/gpt-4.1-mini). `store: false` desactiva el almacenamiento de la respuesta para recuperación en la API; no es una promesa de retención cero por el proveedor. No se registran imagen, clave ni errores crudos del proveedor en logs de la app.

La ruta permite únicamente solicitudes del mismo origen desde `https://quote-manager-rosy.vercel.app` o localhost. Los dominios de preview y otros dominios se rechazan. Valida firma y tamaño del archivo, limita a una lectura simultánea por proceso y espera hasta 35 segundos sin reintentos automáticos. La lista de orígenes no autentica usuarios: la demo sigue sin login ni límite persistente de gasto. La API puede generar cargos por cada lectura.

### Diagnóstico de capturas

`GET /api/capture` indica si el proceso desplegado detecta la clave, sin mostrarla. En Vercel, configurar `OPENAI_API_KEY` en el entorno correspondiente y volver a desplegar. El estado del servidor local no refleja el de Vercel.

Cada POST registra `capture.request` en los logs del servidor con referencia, estado HTTP, etapa, motivo y duración. Los errores muestran esa misma referencia en la interfaz para buscarla en los logs de Vercel. `origin_rejected` identifica un dominio/origen rechazado; `key_missing`, una clave ausente; `provider_authorization`, un rechazo del proveedor; `provider_rate_or_quota`, cuota o límite; `timeout`, tiempo agotado. No se registran claves, imágenes, texto del pedido ni errores crudos del proveedor.

Para errores 429, `provider_insufficient_quota` indica cuota agotada y `provider_rate_limit` un límite temporal. Cuando OpenAI no especifica un código reconocido se conserva `provider_rate_or_quota` sin adivinar la causa. No se reintenta automáticamente.

Se probaron validaciones y respuestas del proveedor simuladas (éxito, formato inválido, rechazo, truncamiento, cuota y autorización). **No se hizo una lectura real: no había API key configurada.** Falta medir precisión, latencia y costo con capturas sintéticas antes de afirmar calidad del OCR. Una captura cortada, borrosa o con varios participantes puede producir omisiones o atribuciones incorrectas; la revisión humana sigue siendo obligatoria.

El parser entiende patrones acotados, no lenguaje natural general: detecta algunas cláusulas adicionales desconocidas, pero puede omitir pedidos implícitos, negaciones o nombres ambiguos. Formatos no reconocidos requieren edición. «2,5» se interpreta como decimal; para miles usar `2000` o `2 mil`, no `2,000`. Medidas sin unidad se interpretan en metros; se admite `200x100 cm`. Una medida sin número de piezas asume una pieza y queda visible para revisión. No se infieren acabados, diseño, descuentos ni entrega. No afirmar que funciona con cualquier mensaje.

Reconstrucción desde el adjunto del usuario. Los documentos originales mencionados no estaban presentes; no se afirma haberlos leído ni haber visto inboxes de negocios reales.

## Una semana más

Validar con una operadora mensajes reales anonimizados y reglas de unidades/acabados; después persistencia con transacciones y copias de seguridad, autenticación y pruebas del flujo completo. Con ese núcleo validado, integrar recepción de WhatsApp y entrega de documentos con reintentos e idempotencia. No automatizar envíos antes de medir errores de interpretación.

## Tiempo y procedencia

Trabajo nuevo en este workspace. El primer commit es del 14 de septiembre de 2026 a las 18:31 (El Salvador); implementación funcional registrada a las 22:05 y verificación/cierre después. Son marcas de tiempo de pared, con conversación y pausas entre ellas, no horas continuas de trabajo. No hubo cronómetro desde el inicio: no se acredita un total exacto ni cumplimiento de cinco horas. Ver `TIMELOG.md` y `AI.md` para el registro y las correcciones de alcance.
