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
