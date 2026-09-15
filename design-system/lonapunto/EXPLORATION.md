# Revisión visual con UI/UX Pro Max

Pantalla aislada `/diseno`, dos variantes con el mismo pedido de Rosa. No guarda cambios en el store de producción. La operadora puede editar piezas/ancho/alto, ver el cálculo y probar finalización local.

## Fuente y criterio

Skill `ui-ux-pro-max` instalada localmente, elegida por la usuaria. Consultas: design-system para print quotation workspace y operations dashboard; typography industrial professional readable; UX animation/accessibility/loading; stack Next.js forms.

La primera recomendación (biophilic + landing) no correspondía al producto y se descartó. De la segunda se retuvieron jerarquía de datos, resaltado legible y edición visible; se descartaron hero, métricas y gráficos no pedidos. La combinación Lexend / Source Sans 3 proviene de Corporate Trust, priorizando lectura. Fuentes alojadas localmente, licencias OFL en public/fonts.

## A · Mesa de trabajo

Source Sans 3 16px, tinta #202633, secundario #596476, acción #234adb. Barra lateral de solicitudes, mensaje horizontal, detalle y total en paralelo. Lectura compacta y controles visibles. Superficies claras para operación diurna de taller.

## B · Orden de taller

Lexend en títulos + Source Sans 3 para datos, grafito #29292c, amarillo #f5c842 con texto oscuro. Mensaje a la izquierda, medidas grandes y cierre debajo del detalle. Identidad más marcada, sin burbujas de bot ni hero.

## Invariantes

Controles ≥44px, tipografía de cuerpo 16px, textos auxiliares ≥12px salvo etiquetas cortas; estados con texto además de color; foco visible, números tabulares, sin animación ornamental. A 375px se ordenan mensaje → detalle → total. El prototipo está identificado como tal; solicitudes adicionales no aparentan ser botones funcionales.

La usuaria eligió A («la A»). Aplicada a la consola real mediante `app/workspace.css`: Source Sans 3, azul tinta, mensaje horizontal y productos junto al resumen. Documento en sección desplegable; bandeja/detalle separados en móvil. No implica adopción de shadcn ni cambios a lógica, visión o catálogo.
