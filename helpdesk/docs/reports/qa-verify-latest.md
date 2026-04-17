# Registro de Ejecucion QA Automatizada

## Datos generales

- Fecha: 2026-04-16T23:35:44.184Z
- Entorno: Local
- Version o referencia del build: QA_APP_URL=http://127.0.0.1:3068
- Ejecutado por: Script qa:verify
- Documento base usado: plantilla-registro-ejecucion-qa.md

## Resultado general

- Estado final: OK
- Resumen ejecutivo: 54 casos OK, 0 casos con fallo.
- Recomendacion final: Aprobado para continuar

## Registro por caso

| ID caso | Rol | Resultado | Evidencia breve | Incidencia detectada | Observaciones |
| --- | --- | --- | --- | --- | --- |
| QA-AUTO-01 | Sistema | OK | `/api/health` respondio 200 con ok=true. |  | Validacion automatizada exitosa |
| QA-AUTO-02 | Cliente | OK | Cliente autenticado y vista `/app/tickets` accesible. |  | Validacion automatizada exitosa |
| QA-AUTO-03 | Agente | OK | Agente autenticado y vista `/app/agent/tickets` accesible. |  | Validacion automatizada exitosa |
| QA-AUTO-04 | Supervisor | OK | Supervisor autenticado con dashboard y departamentos accesibles. |  | Validacion automatizada exitosa |
| QA-AUTO-05 | Cliente | OK | Ticket TKT-100940 creado y visible en cliente/agente. |  | Validacion automatizada exitosa |
| QA-AUTO-06 | Agente | OK | Comentario interno oculto para cliente y visible para agente. |  | Validacion automatizada exitosa |
| QA-AUTO-06A | Cliente | OK | Cliente recibe 404 al intentar abrir ticket ajeno por URL directa. |  | Validacion automatizada exitosa |
| QA-AUTO-06B | Cliente | OK | Cliente filtra por estado y busca por numero correctamente. |  | Validacion automatizada exitosa |
| QA-AUTO-06C | Agente | OK | Agente filtra y busca tickets en su cola operativa. |  | Validacion automatizada exitosa |
| QA-AUTO-06D | Supervisor | OK | Supervisor filtra por estado/categoria y busca por numero correctamente. |  | Validacion automatizada exitosa |
| QA-AUTO-06E | Agente | OK | Agente recibe 404 al intentar abrir ticket fuera de su contexto por URL directa. |  | Validacion automatizada exitosa |
| QA-AUTO-07 | Supervisor | OK | Departamento QA Dept 1776382478616 creado, editado y visible en supervisor. |  | Validacion automatizada exitosa |
| QA-AUTO-10 | Supervisor | OK | Supervisor accede a `/app/supervisor/users` y ve solo usuarios internos. |  | Validacion automatizada exitosa |
| QA-AUTO-11 | Supervisor | OK | Supervisor actualizo a diego.soporte@techsupport.local con department=Redes y active=false. |  | Validacion automatizada exitosa |
| QA-AUTO-12 | Supervisor | OK | La UI bloquea guardar un agente sin departamento y preserva los datos persistidos. |  | Validacion automatizada exitosa |
| QA-AUTO-13 | Agente | OK | El ticket TKT-100941 exige nota de resolucion y persiste resolution_note al resolver. |  | Validacion automatizada exitosa |
| QA-AUTO-14 | Agente | OK | El ticket TKT-100942 bloquea cierre y reapertura manual desde la vista operativa interna. |  | Validacion automatizada exitosa |
| QA-AUTO-15 | Cliente | OK | El cliente puede cerrar o solicitar reapertura desde resolved con validaciones de motivo y detalle libre cuando aplica. |  | Validacion automatizada exitosa |
| QA-AUTO-16 | Cliente | OK | El cliente ve cierre en TKT-100945 y reapertura en TKT-100946. |  | Validacion automatizada exitosa |
| QA-AUTO-16A | Supervisor | OK | El supervisor ve cierre en TKT-100947 y reapertura en TKT-100948. |  | Validacion automatizada exitosa |
| QA-AUTO-16B | Agente | OK | El agente ve cierre en TKT-100949 y reapertura en TKT-100950. |  | Validacion automatizada exitosa |
| QA-AUTO-17 | Cliente | OK | El ticket TKT-100951 persiste adjunto y lo muestra en detalle para cliente y agente. |  | Validacion automatizada exitosa |
| QA-AUTO-18 | Cliente | OK | El comentario publico sobre TKT-100952 persiste adjunto y es visible para agente y cliente. |  | Validacion automatizada exitosa |
| QA-AUTO-19 | Cliente | OK | La app bloquea adjuntos mayores a 5 MB con error controlado. |  | Validacion automatizada exitosa |
| QA-AUTO-20 | Cliente | OK | El cliente recibe notificaciones internas por comentario publico y resolucion sobre TKT-100953. |  | Validacion automatizada exitosa |
| QA-AUTO-21 | Agente | OK | El agente destino recibe notificacion interna al reasignar TKT-100954. |  | Validacion automatizada exitosa |
| QA-AUTO-22 | Cliente | OK | El panel permite marcar una notificacion como revisada y deja de mostrarla como pendiente. |  | Validacion automatizada exitosa |
| QA-AUTO-23 | Agente | OK | El ticket TKT-100955 se comporta como estado final cerrado en cliente, agente y supervisor. |  | Validacion automatizada exitosa |
| QA-AUTO-24 | Sistema | OK | El ticket TKT-100956 se autocerro por vencimiento con motivo sin_respuesta_cliente y notificaciones emitidas. |  | Validacion automatizada exitosa |
| QA-AUTO-33 | Sistema | OK | El autocierre registro corrida success (ex9qygh0ngrelbv) y libero el lock correctamente. |  | Validacion automatizada exitosa |
| QA-AUTO-34 | Sistema | OK | La segunda corrida quedo en skipped (cudrzelinz153vd) al detectar lock activo. |  | Validacion automatizada exitosa |
| QA-AUTO-35 | Sistema | OK | El dry-run registro corrida p80ouqepko22apu sin modificar el ticket TKT-100958. |  | Validacion automatizada exitosa |
| QA-AUTO-36 | Sistema | OK | La corrida qarx59z6u9a7t4o quedo en partial_failure, mantuvo TKT-100959 en resolved y cerro TKT-100960. |  | Validacion automatizada exitosa |
| QA-AUTO-37 | Sistema | OK | `/api/health` refleja dependencia PocketBase y tiempo de respuesta operativo. |  | Validacion automatizada exitosa |
| QA-AUTO-38 | Supervisor | OK | Las exportaciones supervisor siguen respondiendo correctamente tras agregar logging operativo estructurado. |  | Validacion automatizada exitosa |
| QA-AUTO-41 | Cliente | OK | El cliente no accede a paginas supervisor por URL directa y es redirigido fuera de ese contexto. |  | Validacion automatizada exitosa |
| QA-AUTO-42 | Agente | OK | El agente no accede a paginas supervisor por URL directa y es redirigido fuera de ese contexto. |  | Validacion automatizada exitosa |
| QA-AUTO-43 | Sistema | OK | Los exports supervisor responden 403 para cliente y agente sin permisos. |  | Validacion automatizada exitosa |
| QA-AUTO-44 | Sistema | OK | La accion de notificacion ignoro un notificationId ajeno y no altero el registro del cliente. |  | Validacion automatizada exitosa |
| QA-AUTO-45 | Sistema | OK | El backup local genero respaldo valido en C:\Users\jose.galicia\Documents\Git-Prct-IA\helpdesk\backups\pocketbase\backup-2026-04-16T23-35-22-664Z. |  | Validacion automatizada exitosa |
| QA-AUTO-46 | Sistema | OK | El restore-check valido correctamente el respaldo C:\Users\jose.galicia\Documents\Git-Prct-IA\helpdesk\backups\pocketbase\backup-2026-04-16T23-35-25-099Z sin mutar datos activos. |  | Validacion automatizada exitosa |
| QA-AUTO-47 | Sistema | OK | El restore de PocketBase no se aplica accidentalmente sin PB_RESTORE_APPLY=1. |  | Validacion automatizada exitosa |
| QA-AUTO-48 | Visitante | OK | Login, register y forgot-password exponen la navegacion publica esperada. |  | Validacion automatizada exitosa |
| QA-AUTO-49 | Visitante | OK | La solicitud de recuperacion de password se procesa con respuesta controlada. |  | Validacion automatizada exitosa |
| QA-AUTO-25 | Supervisor | OK | Supervisor descarga exportacion CSV de tickets con encabezado y contenido real. |  | Validacion automatizada exitosa |
| QA-AUTO-26 | Supervisor | OK | Supervisor descarga metricas JSON con counts, agedTickets y marca temporal de generacion. |  | Validacion automatizada exitosa |
| QA-AUTO-27 | Supervisor | OK | Supervisor exporta CSV filtrado y el archivo respeta status, priority y q activos. |  | Validacion automatizada exitosa |
| QA-AUTO-28 | Supervisor | OK | Supervisor exporta CSV filtrado y el archivo respeta departamento, agente asignado y rango de fechas activos. |  | Validacion automatizada exitosa |
| QA-AUTO-29 | Supervisor | OK | Dashboard supervisor muestra tasa de reapertura, tiempos separados y desglose de backlog envejecido con valores esperados. |  | Validacion automatizada exitosa |
| QA-AUTO-30 | Supervisor | OK | Supervisor descarga metricas JSON ampliadas con tasa de reapertura, tiempos separados y backlog envejecido desglosado. |  | Validacion automatizada exitosa |
| QA-AUTO-31 | Supervisor | OK | Dashboard supervisor muestra bloque de resumen ejecutivo con highlights, focos operativos y acceso de descarga. |  | Validacion automatizada exitosa |
| QA-AUTO-32 | Supervisor | OK | Supervisor descarga resumen gerencial en Markdown con encabezado, KPIs principales, highlights y focos operativos. |  | Validacion automatizada exitosa |
| QA-AUTO-08 | Agente | OK | Cliente confirmo cierre de TKT-100961 con closed_at persistido. |  | Validacion automatizada exitosa |
| QA-AUTO-09 | Supervisor | OK | Cliente solicito reapertura de TKT-100962 con motivo persistido. |  | Validacion automatizada exitosa |

## Incidencias abiertas

| ID incidencia | Severidad | Caso asociado | Descripcion | Estado |
| --- | --- | --- | --- | --- |
| Sin incidencias | Baja | - | No se detectaron incidencias abiertas en la ejecucion automatizada. | Cerrada |

## Checklist de cierre

- x Se ejecutaron los casos criticos
- x Se registraron evidencias minimas
- x Las incidencias quedaron documentadas
- x Se definio recomendacion final

## Resumen tecnico

- App URL: http://127.0.0.1:3068
- PocketBase URL: http://127.0.0.1:8090
- Casos OK: 54
- Casos con fallo: 0

## Firma o responsable

- Nombre: Script qa:verify
- Fecha de cierre: 2026-04-16T23:35:44.186Z

