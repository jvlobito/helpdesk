# Documentacion de Validacion y Pruebas

## Objetivo

Centralizar los documentos de validacion funcional y pruebas manuales del proyecto HelpDesk.

## Documentos disponibles

### 0. Estado por fase

Archivos:
- `fase-1-cierre.md`
- `fase-2-cierre.md`
- `fase-3-cierre.md`
- `fase-4-cierre.md`
- `fase-3-plan.md`
- `fase-4-plan.md`
- `fase-5-plan.md`

Uso recomendado:
- para entender el estado actual del proyecto,
- para cerrar formalmente Fase 1,
- para cerrar formalmente Fase 2,
- para cerrar formalmente Fase 3,
- para cerrar formalmente Fase 4,
- para arrancar Fase 4 con alcance claro,
- para planear Fase 5 con foco en reporting y analitica avanzada.

### 0.1 Operacion y demo

Archivo:
- `operacion-y-demo.md`

Uso recomendado:
- para levantar el MVP rapido,
- para ejecutar una demo funcional por rol,
- para orientar validaciones internas sin contexto adicional.

### 1. Bloque basico de pruebas

Archivo:
- `bloque-basico-pruebas.md`

Uso recomendado:
- cuando se necesita validar funcionalidad principal con pasos detallados,
- cuando negocio, producto o desarrollo quieren una guia simple pero completa.

### 2. Matriz QA funcional

Archivo:
- `matriz-qa-funcional.md`

Uso recomendado:
- cuando QA necesita trazabilidad por caso,
- cuando se requiere registrar prioridad, cobertura y resultado esperado por modulo.

### 3. Smoke test de 5 minutos

Archivo:
- `smoke-test-5-min.md`

Uso recomendado:
- despues de fixes rapidos,
- despues de despliegues o cambios pequeños,
- para confirmar que el MVP sigue operativo sin ejecutar toda la bateria.

### 4. Plantilla de registro de ejecucion QA

Archivo:
- `plantilla-registro-ejecucion-qa.md`

Uso recomendado:
- para documentar ejecuciones reales,
- para registrar evidencia, incidencias y recomendacion final.

### 4.1 Guia de qa:verify

Archivo:
- `qa-verify-guia.md`
- `qa-trazabilidad.md`

Uso recomendado:
- para ejecutar la verificacion automatizada principal,
- para interpretar `qa-verify-latest.md` y los reportes historicos,
- para mapear casos manuales `QA-XX` contra checks `QA-AUTO-XX`.

### 5. Validacion manual por fase

Archivos:
- `fase-1-validacion-manual.md`
- `fase-2-validacion-manual.md`

Uso recomendado:
- para cierre de fase,
- para validar alcance completo implementado en cada etapa.

## Flujo sugerido de uso

1. Usar `smoke-test-5-min.md` para validacion rapida.
2. Usar `bloque-basico-pruebas.md` para validacion funcional base.
3. Usar `matriz-qa-funcional.md` si se necesita seguimiento formal por caso.
4. Registrar la ejecucion en `plantilla-registro-ejecucion-qa.md`.
5. Para cierres importantes, complementar con `fase-1-validacion-manual.md` o `fase-2-validacion-manual.md`.
