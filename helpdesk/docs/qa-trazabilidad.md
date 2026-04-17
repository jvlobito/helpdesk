# Trazabilidad QA Manual vs QA Automatizado

## Objetivo

Relacionar los casos `QA-XX` de la matriz funcional con los checks `QA-AUTO-XX` de `qa:verify` para saber que ya esta cubierto automaticamente, que esta cubierto de forma parcial y que sigue dependiendo de validacion manual.

## Tabla de trazabilidad

| QA manual | Cobertura automatica | Estado | Notas |
| --- | --- | --- | --- |
| QA-01 | QA-AUTO-02 | Completa | Login cliente y redireccion por rol |
| QA-02 | QA-AUTO-03 | Completa | Login agente y acceso a cola operativa |
| QA-03 | QA-AUTO-04 | Completa | Login supervisor y acceso a dashboard |
| QA-04 | QA-AUTO-05 | Completa | Creacion real de ticket y visibilidad |
| QA-05 | Sin mapping directo | Pendiente | Faltan asserts finos de preservacion de valores y errores por campo |
| QA-06 | QA-AUTO-06B | Completa | Filtros y busqueda en vista cliente |
| QA-07 | Sin mapping directo | Parcial | Se cubre indirectamente por comentarios publicos, pero no con caso explicito de cliente comentando su propio ticket |
| QA-08 | Sin mapping directo | Parcial | `qa:verify` cubre visibilidad de cola y cierre, pero no una toma completa via UI real |
| QA-09 | Sin mapping directo | Parcial | Se cubren cambios de estado en 4.4, pero no hay check dedicado para `waiting` o `resolved` |
| QA-10 | QA-AUTO-21 | Parcial | Se cubre reasignacion al agente destino y notificacion; falta assert explicito del selector limitado al mismo departamento |
| QA-11 | QA-AUTO-06 | Completa | Comentario interno visible para agente y oculto para cliente |
| QA-12 | QA-AUTO-07 | Completa | Creacion y edicion de departamentos |
| QA-13 | Sin mapping directo | Pendiente | Falta automatizar errores de validacion de departamentos |
| QA-14 | QA-AUTO-14 | Completa | La vista operativa interna bloquea cierre y reapertura desde `resolved` |
| QA-15 | QA-AUTO-04 | Parcial | Se valida acceso a dashboard, no el detalle completo de metricas y listados |
| QA-16 | Sin mapping directo | Pendiente | Falta caso dedicado al comentario simple sin error falso |
| QA-17 | QA-AUTO-20 | Parcial | Se valida comentario publico y notificacion al cliente; falta assert dedicado sobre visualizacion del comentario publico concreto |
| QA-18 | QA-AUTO-06 | Parcial | Se valida ocultamiento del comentario interno; falta assert explicito sobre adjuntos internos ocultos |
| QA-19 | QA-AUTO-17, QA-AUTO-18 | Completa | Ticket y comentario con adjunto visible |
| QA-20 | QA-AUTO-19 | Completa | Bloqueo de archivo mayor a 5 MB |
| QA-21 | QA-AUTO-20 | Completa | Notificacion por comentario publico |
| QA-22 | QA-AUTO-20 | Completa | Notificacion por cambio de estado |
| QA-23 | QA-AUTO-21 | Completa | Notificacion por reasignacion al agente destino |
| QA-24 | QA-AUTO-10 | Completa | Vista de usuarios internos |
| QA-25 | QA-AUTO-11 | Completa | Actualizacion de departamento y estado |
| QA-26 | QA-AUTO-12 | Completa | Validacion de agente sin departamento |
| QA-27 | QA-AUTO-13, QA-AUTO-08 | Completa | Resolucion con nota obligatoria y cierre confirmado por cliente |
| QA-28 | QA-AUTO-09 | Completa | Reapertura con motivo obligatorio desde `resolved` por cliente |
| QA-29 | QA-AUTO-15 | Completa | Motivo `otro` exige detalle libre en cierre y reapertura validos |
| QA-30 | QA-AUTO-16, QA-AUTO-16A, QA-AUTO-16B | Completa | Visibilidad por cliente, supervisor y agente |
| QA-31 | QA-AUTO-23 | Completa | Ticket `closed` tratado como estado final sin comentarios ni acciones operativas |
| QA-32 | QA-AUTO-24 | Completa | Autocierre batch de tickets `resolved` vencidos con motivo `sin_respuesta_cliente` |
| QA-33 | QA-AUTO-25 | Completa | Supervisor descarga exportacion CSV de tickets con contenido real |
| QA-34 | QA-AUTO-26 | Completa | Supervisor descarga metricas JSON del dashboard |
| QA-35 | QA-AUTO-27 | Completa | Supervisor exporta CSV respetando filtros activos en la vista global de tickets |
| QA-36 | QA-AUTO-28 | Completa | Supervisor exporta CSV respetando `departmentId`, `assignedToId` y rango de fechas en la vista global de tickets |
| QA-37 | QA-AUTO-29 | Completa | Dashboard supervisor muestra KPI ampliado con tasa de reapertura, tiempos separados y desglose de backlog envejecido |
| QA-38 | QA-AUTO-30 | Completa | Exportacion JSON de metricas expone KPI ampliado y desglose de backlog envejecido |
| QA-39 | QA-AUTO-31 | Completa | Dashboard supervisor muestra resumen ejecutivo y acceso a descarga gerencial |
| QA-40 | QA-AUTO-32 | Completa | Exportacion Markdown gerencial resume KPIs, highlights y focos operativos |
| QA-41 | QA-AUTO-33 | Completa | Autocierre registra `job_run` exitoso y libera lock |
| QA-42 | QA-AUTO-34 | Completa | Lock activo deja corrida de autocierre en `skipped` |
| QA-43 | QA-AUTO-35 | Completa | `DRY_RUN` de autocierre no modifica tickets candidatos |
| QA-44 | QA-AUTO-36 | Completa | Falla controlada deja corrida de autocierre en `partial_failure` |
| QA-45 | QA-AUTO-37 | Completa | Health endpoint refleja estado real de PocketBase y tiempo de respuesta |
| QA-46 | QA-AUTO-38 | Completa | Exportaciones supervisor siguen respondiendo bien tras agregar logging operativo |
| QA-50 | QA-AUTO-41 | Completa | Cliente no accede a paginas supervisor por URL directa |
| QA-51 | QA-AUTO-42 | Completa | Agente no accede a paginas supervisor por URL directa |
| QA-52 | QA-AUTO-43 | Completa | Exports supervisor responden `403` a roles no autorizados |
| QA-53 | QA-AUTO-44 | Completa | `markNotificationReadAction` no modifica notificaciones ajenas |
| QA-54 | QA-AUTO-45 | Completa | `pb:backup` genera respaldo local valido de `pb_data` |
| QA-55 | QA-AUTO-46 | Completa | `pb:restore:check` valida un respaldo sin mutar datos activos |
| QA-56 | QA-AUTO-47 | Completa | `pb:restore` no aplica restore sin confirmacion explicita |
| QA-57 | QA-AUTO-48 | Completa | Login y register exponen enlaces cruzados y acceso a recuperacion |
| QA-58 | QA-AUTO-49 | Completa | Forgot-password procesa solicitud valida con respuesta controlada |

## Resumen por fase

### Fase 1

- cobertura automatica completa fuerte: `QA-01`, `QA-02`, `QA-03`, `QA-04`, `QA-06`, `QA-11`, `QA-12`, `QA-14`
- cobertura automatica parcial relevante: `QA-07`, `QA-08`, `QA-09`, `QA-10`, `QA-15`
- pendientes dedicados de automatizar: `QA-05`, `QA-13`, `QA-16`

### Fase 4

- cobertura automatica completa fuerte: `QA-19` a `QA-32`, `QA-33`, `QA-34`
- foco cubierto: adjuntos, notificaciones, administracion de usuarios, cierre/reapertura, estado final `closed`, autocierre y exportacion ligera

## Nota para Fase 4.6

- `QA-AUTO-23`: ticket `closed` tratado como estado final en cliente, agente y supervisor
- `QA-AUTO-24`: autocierre batch de tickets `resolved` vencidos con motivo `sin_respuesta_cliente`

## Resumen rapido

- Cobertura automatica completa fuerte: `QA-01` a `QA-04`, `QA-06`, `QA-11`, `QA-12`, `QA-14`, `QA-19` a `QA-30`
- Cobertura parcial: `QA-07`, `QA-08`, `QA-09`, `QA-10`, `QA-15`, `QA-17`, `QA-18`
- Pendiente de automatizar de forma dedicada: `QA-05`, `QA-13`, `QA-16`

## Nota sobre lifecycle

- `closed` se trata como estado final
- la reapertura valida es `resolved -> reopened`
- no existe transicion `closed -> reopened`
