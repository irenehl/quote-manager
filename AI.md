# Uso de AI

Implementación asistida por Codex a partir del documento de reconstrucción. Reglas y precios explícitos; en el MVP inicial ningún modelo participaba en el producto. En una iteración posterior la usuaria aprobó lectura opcional de capturas con visión; el cálculo continúa siendo determinista.

El adjunto describe un error del parser original: tomar «un evento» como cantidad y perder el match específico «hoja partida». Esta reconstrucción protege cantidad a la izquierda y prioridad de alias específicos con pruebas; ese incidente no se presenta como ocurrido durante esta sesión.

No se tuvo acceso a los docs originales ni al repo anterior. La dirección visual es una interpretación nueva del patrón bandeja/hilo/documento autorizado en el adjunto.

## Herramientas y reparto

Se usaron herramientas de desarrollo para Next.js/TypeScript, pruebas `node:test` mediante tsx y navegador integrado para verificar la UI. La interfaz final usa la skill UI/UX Pro Max; la lectura de capturas se contrastó con documentación oficial. No se ejecutaron llamadas reales al modelo por falta de credencial.

## Iteración de visión

La usuaria preguntó por reconocer capturas y aprobó incorporarlo. `lib/vision.ts` contiene el prompt real y el contrato JSON. La imagen se trata como contenido no confiable, la lectura no tiene herramientas, y el resultado se valida antes de mostrarlo. El operador revisa la imagen y el texto antes de generar la cotización. Los tests del proveedor son simulados y no constituyen una evaluación de precisión visual.

La mayor parte del código, CSS, pruebas y borradores de documentación la generó AI. La usuaria aportó el caso y la asignación, detuvo una implementación prematura, pidió revisar flujos/lógica/viabilidad y aprobó un alcance menor con entrega manual. No se atribuye a la usuaria una revisión línea por línea que no está registrada. Este reparto describe tareas observadas, no un porcentaje medido.

## Prompts reales que cambiaron el trabajo

1. «si algun flujo no te hace snetiod, puedes preguntar, no necesito que rehagas todo de golpe» seguido de «revisa flujos / logica / viabilidad». Frenó la construcción y llevó a revisar medidas faltantes, envíos y actualización de precios.
2. «esta es la asignacion, crees que encaja para el puesto de forward deployed developer lo que estamos haciendo?» junto con el challenge. Cambió el criterio de éxito: un pedido nuevo que termina en un documento útil, con límites explicables.
3. «PLEASE IMPLEMENT THIS PLAN» seguido del plan aprobado. Concretó estados, revisión humana, snapshot de la cotización y pruebas; sustituyó el envío simulado por finalización y entrega manual.

## Errores reales y cómo se detectaron

Exploración visual posterior: prompt real «usemso https://www.skills.sh/nextlevelbuilder/ui-ux-pro-max-skill/ui-ux-pro-max mejor». Se usó la skill instalada UI/UX Pro Max para comparar dos composiciones en `/diseno`, con tipografías locales Source Sans 3 y Lexend. Se descartó una primera recomendación automática de estética orgánica por no encajar con una herramienta de imprenta. Las decisiones están en `design-system/lonapunto/EXPLORATION.md`; la prueba usa datos de ejemplo y no guarda cotizaciones ni sustituye la UI principal.

- El agente comenzó a implementar antes de validar el flujo. La usuaria lo detectó y pidió revisar el problema; el plan posterior eliminó funcionalidades que no mejoraban el recorrido principal.
- El primer build encontró una etiqueta `h1` sin cerrar; se corrigió y el siguiente build pasó.
- La revisión visual móvil mostró que, al ocultar el panel derecho, faltaba el total al momento de finalizar. Se añadió subtotal, IVA y total al pie de revisión, junto al acceso al borrador.
- La prueba manual con dos pestañas confirmó que cambiar un precio obliga a revisar nuevamente antes de finalizar.

El error «un evento» del documento de contexto se protege con una prueba de regresión, pero no se presenta como un fallo ocurrido en esta implementación.
