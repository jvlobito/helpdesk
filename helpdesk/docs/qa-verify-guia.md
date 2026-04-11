# Guia de Uso - qa:verify

## Objetivo

Explicar como ejecutar la verificacion automatizada principal del MVP y como interpretar sus reportes.

## Comando

```bash
npm run qa:verify
```

## Precondiciones

- PocketBase activo en `http://127.0.0.1:8090`
- App en produccion activa en `http://127.0.0.1:3020`
- Datos cargados con `npm run pb:bootstrap`
- Variables admin disponibles en `.env.local`

## Qué verifica actualmente

- health endpoint
- login por rol
- acceso a vistas protegidas clave
- creacion real de ticket y visibilidad
- comentario interno visible para agente y oculto para cliente
- cliente no accede por URL a ticket ajeno
- agente no accede por URL a ticket fuera de su contexto
- filtros y busqueda en cliente, agente y supervisor
- creacion y edicion de departamentos
- vista de usuarios internos para supervisor
- actualizacion de departamento y estado de usuario interno
- validacion de agente sin departamento
- resolucion con nota obligatoria
- cierre por cliente con motivo obligatorio desde `resolved`
- reapertura por cliente con motivo obligatorio desde `resolved`
- validacion de opcion `otro` con detalle libre obligatorio
- visibilidad de seguimiento de cierre para cliente, agente y supervisor
- adjunto valido en ticket con visibilidad en detalle
- adjunto valido en comentario publico con visibilidad en detalle
- validacion de adjunto mayor a 5 MB
- notificaciones internas por comentario publico y cambio de estado
- notificacion interna por reasignacion al agente destino
- marcado de notificacion como revisada y ocultamiento de pendientes
- respuesta del cliente para cierre o reapertura de ticket resuelto
- exportacion CSV de tickets para supervisor
- exportacion JSON de metricas para supervisor

## Cobertura por fase

### Fase 2

Cobertura automatizada actual:

- login por rol
- creacion real de ticket
- filtros y busqueda
- creacion y edicion de departamentos
- cierre manual por agente y supervisor

### Fase 3

Cobertura automatizada actual:

- comentario interno visible para agente y oculto para cliente
- guardrails de acceso por URL para cliente y agente
- acceso base a dashboard y vistas protegidas de supervisor

### Fase 4

Cobertura automatizada actual:

- bloque 4.3 administracion operativa de usuarios
  - vista de usuarios internos
  - actualizacion valida de departamento y estado
  - validacion de agente sin departamento
- bloque 4.1 adjuntos
  - adjunto valido en ticket y visibilidad en detalle
  - adjunto valido en comentario publico y visibilidad en detalle
  - validacion de archivo mayor a 5 MB
- bloque 4.2 notificaciones internas
  - notificacion por comentario publico
  - notificacion por cambio de estado
  - notificacion por reasignacion al agente destino
  - notificacion revisada deja de verse como pendiente
- bloque 4.4 cierre y seguimiento mejorado
  - resolucion con nota obligatoria
  - cierre por cliente desde `resolved`
  - reapertura por cliente desde `resolved`
  - opcion `otro` con detalle libre obligatorio
  - visibilidad del bloque de seguimiento para cliente, agente y supervisor
- bloque 4.5 exportacion y analitica operativa ligera
  - exportacion CSV de tickets
  - exportacion JSON de metricas del dashboard

Cobertura automatizada pendiente:

- validaciones adicionales de adjuntos internos y combinaciones edge
 - validaciones adicionales del feed de notificaciones historicas y comportamiento visual fino del panel

## Estado real de completitud

`qa:verify` no cubre todavia todas las fases completas del proyecto.

Hoy funciona como smoke automatizado principal de regresion, con buena cobertura de Fase 2, Fase 3 y bloques relevantes de Fase 4, pero aun necesita ampliacion para cubrir de forma automatica todos los casos edge y todos los casos manuales de la matriz funcional.

## Siguiente ampliacion recomendada

Para acercarlo a cobertura completa por fases, el siguiente orden recomendado es:

1. mapear formalmente cada `QA-AUTO-*` contra casos `QA-XX` de la matriz funcional
2. ampliar adjuntos hacia casos internos y multiples archivos
3. ampliar notificaciones hacia escenarios historicos o de lectura si el producto lo requiere

## Salidas generadas

Cada ejecucion genera:

- un reporte historico en `docs/reports/qa-verify-<timestamp>.md`
- una copia del ultimo resultado en `docs/reports/qa-verify-latest.md`

## Como leer el resultado

### Estado final

- `OK`: todos los checks pasaron
- `FALLO`: al menos un check fallo

### Registro por caso

Cada fila indica:
- ID del caso
- rol principal afectado
- resultado
- evidencia breve
- incidencia detectada si hubo fallo

### Incidencias abiertas

- si no hay fallos, el reporte deja constancia de que no hubo incidencias abiertas
- si hay fallos, cada uno aparece como incidencia `INC-AUTO-XXX`

## Uso recomendado

Ejecutar `qa:verify`:

1. despues de cambios en reglas de negocio
2. despues de cambios en permisos
3. despues de cambios en formularios o flujos clave
4. antes de cerrar un bloque o una fase
5. antes de demo interna o validacion final

## Limites actuales

- no reemplaza pruebas manuales completas
- no cubre experiencia visual o responsive en detalle
- no cubre todos los casos edge del dashboard

## Recomendacion practica

Usar este orden:

1. `npm run build`
2. `npm run qa:verify`
3. revisar `docs/reports/qa-verify-latest.md`
4. si hace falta, complementar con `smoke-test-5-min.md` o `matriz-qa-funcional.md`
