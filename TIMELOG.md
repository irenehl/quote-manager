# Registro de trabajo

Iteración posterior de diseño: a petición de la usuaria se aplicó UI/UX Pro Max a dos variantes interactivas aisladas en `/diseno`, sin reemplazar la consola. Build webpack correcto; revisión visual de ambas en escritorio y móvil de 375 px sin desbordamiento horizontal. Se verificaron cambios de medidas, total, documento y finalización local de muestra. Duración de foco no instrumentada; no se atribuye al timebox original.

Iteración posterior: lectura opcional de capturas autorizada por la usuaria. Integración de Responses, entrada de imagen con vista previa, revisión obligatoria y cinco pruebas de contrato/errores. No se pudo medir OCR real al no existir una API key configurada. Esta iteración amplía el MVP y no se atribuye al timebox original.

Verificación de esta iteración: 25 pruebas pasan y TypeScript correcto. Turbopack falló al abrir un puerto interno restringido por el sandbox; `npm run build -- --webpack` completó el build. En navegador se verificó la pestaña de captura, el aviso de credencial ausente y el bloqueo de preparar antes de leer/revisar. No se verificó el éxito visual contra el proveedor real.

Iteración posterior de UX: se mantuvo la imprenta por decisión de la usuaria y se reemplazaron los tres campos de entrada por un único mensaje, con extracción conservadora de contacto y cuatro pruebas adicionales. Esta iteración es posterior al cierre original y no se incluye retroactivamente en su timebox.

2026-09-14: lectura del adjunto e inspección del workspace vacío. Reconstrucción nueva; no se copió la cola Ya pagué / NorteMed. Registro de esta sesión, sin atribuir tiempos ni commits del proyecto original. Duración exacta no instrumentada.

Marcas de tiempo verificables, zona America/El_Salvador:

- 18:31: primer commit de README, AI.md, límites e infraestructura inicial. Después, borrador de lógica.
- Entre 18:31 y 22:05: conversación, pausa de implementación, lectura de la asignación, revisión del alcance y plan aprobado; construcción de lógica, UI y 15 pruebas. El intervalo incluye pausas: no es una medida de esfuerzo.
- 22:05: commit de implementación; build de producción correcto y arranque local. Prueba de pedido nuevo, excepción y finalización en navegador.
- Desde 22:05: comprobación de precios en dos pestañas, documento y móvil de 375 px; corrección de resumen de total móvil, modal accesible y cantidades negativas; documentación final y nueva verificación.

No se puede reconstruir honestamente un total de horas de foco con estas marcas. La usuaria debe completar cualquier registro personal adicional; no se atribuye un timebox de cinco horas cumplido sin evidencia.

22:10: versión final con 16 pruebas aprobadas, build correcto, `/health` verificado y demo reiniciada con los ocho ejemplos. No se generó un PDF durante la verificación; se inspeccionó su documento HTML y se probó la acción de impresión.
