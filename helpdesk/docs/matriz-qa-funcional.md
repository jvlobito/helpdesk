# Matriz QA Funcional

## Objetivo

Tener una matriz simple y trazable para validar la funcionalidad operativa actual del MVP.

## Precondiciones generales

- PocketBase activo en `http://127.0.0.1:8090`
- App en produccion activa en `http://127.0.0.1:3020`
- Datos reiniciados con `npm run pb:bootstrap`
- Sesion limpia por cada caso o cambio de rol

## Usuarios base

- Cliente: `cliente@acme.com / ChangeMe123!`
- Agente IT: `ana.agente@techsupport.local / ChangeMe123!`
- Agente IT 2: `diego.soporte@techsupport.local / ChangeMe123!`
- Supervisor: `supervisor@techsupport.local / ChangeMe123!`

## Cobertura sugerida por fase

### Fase 1

- `QA-01` a `QA-15`
- foco: login por rol, creacion base de ticket, comentarios, flujo base de agente, departamentos y acceso inicial a dashboard

### Fase 4

- `QA-19` a `QA-34`
- foco: adjuntos, notificaciones, administracion operativa de usuarios, cierre/reapertura trazables, exportacion ligera y autocierre

## Matriz

| ID | Modulo | Rol | Datos de prueba | Pasos resumidos | Resultado esperado | Prioridad |
| --- | --- | --- | --- | --- | --- | --- |
| QA-01 | Login | Cliente | `cliente@acme.com / ChangeMe123!` | Iniciar sesion en `/login` | Redirige a `/app/tickets` | Alta |
| QA-02 | Login | Agente | `ana.agente@techsupport.local / ChangeMe123!` | Iniciar sesion en `/login` | Redirige a `/app/agent/tickets` | Alta |
| QA-03 | Login | Supervisor | `supervisor@techsupport.local / ChangeMe123!` | Iniciar sesion en `/login` | Redirige a `/app/supervisor/dashboard` | Alta |
| QA-04 | Crear ticket | Cliente | Titulo `Prueba QA cliente`, prioridad `high`, categoria `software`, depto `Soporte TI` | Crear ticket desde `/app/tickets/new` | Redirige a `/app/tickets?created=1`, muestra exito y lista el ticket | Alta |
| QA-05 | Validacion ticket | Cliente | Formulario vacio o incompleto | Enviar formulario con errores | Se muestran errores y no se pierden valores capturados | Media |
| QA-06 | Filtros tickets | Cliente | `q=TKT-00001`, `status=in_progress` | Filtrar en `/app/tickets` | Lista consistente y URL con query params | Alta |
| QA-07 | Comentario publico | Cliente | `Comentario publico de validacion.` | Abrir ticket propio y comentar | Mensaje de exito y comentario visible en detalle | Alta |
| QA-08 | Toma de ticket | Agente | Ticket `new` de `Soporte TI` | Abrir ticket y usar `Tomar ticket` | Ticket pasa a `in_progress` y muestra mensaje de exito | Alta |
| QA-09 | Cambio de estado | Agente | Estado destino `waiting` o `resolved` | Cambiar estado desde detalle | Mensaje de exito y transicion valida persistida | Alta |
| QA-10 | Reasignacion | Agente o Supervisor | Agente del mismo departamento | Reasignar desde detalle | Solo muestra agentes del mismo departamento y persiste cambio | Alta |
| QA-11 | Comentario interno | Agente o Supervisor | `Nota interna QA.` | Crear comentario interno | Visible para agente/supervisor y oculto para cliente | Alta |
| QA-12 | Gestion departamentos | Supervisor | Nombre `Calidad QA`, email `calidad.qa@techsupport.local` | Crear departamento y luego editarlo | Se muestran mensajes de exito y el dato queda persistido | Alta |
| QA-13 | Validacion departamentos | Supervisor | Email invalido o nombre vacio | Enviar formulario invalido | Se muestra error y el formulario conserva datos | Media |
| QA-14 | Bloqueo de cierre/reapertura manual interna | Agente asignado o Supervisor | Ticket en `resolved` | Intentar cerrar o reabrir desde la vista operativa interna | El sistema bloquea ambas acciones y el ticket permanece en `resolved` hasta respuesta del cliente | Alta |
| QA-15 | Dashboard supervisor | Supervisor | Dataset bootstrap | Abrir `/app/supervisor/dashboard` | Conteos y listados cargan con datos reales | Media |
| QA-16 | Comentario sin error falso | Cliente, Agente o Supervisor | Comentario simple sin adjuntos | Agregar comentario desde detalle | El comentario se guarda y no aparece error falso de recurso no localizado | Alta |
| QA-17 | Comentario publico visible al cliente | Agente o Supervisor y luego Cliente | Comentario publico `Seguimiento visible al cliente` | Crear comentario publico y volver a entrar como cliente al mismo ticket | El cliente ve el comentario publico del agente o supervisor | Alta |
| QA-18 | Comentario interno oculto al cliente | Agente o Supervisor y luego Cliente | Comentario interno `Nota operativa interna` | Crear comentario interno y revisar el mismo ticket como cliente | El cliente no ve el comentario interno ni sus adjuntos | Alta |
| QA-19 | Adjunto en ticket o comentario | Cliente y/o Agente | Archivo pequeno valido, por ejemplo `qa-attachment.txt` | Crear ticket o comentario con adjunto y abrir el detalle | El adjunto aparece visible y puede abrirse o descargarse | Alta |
| QA-20 | Validacion de adjunto mayor a 5 MB | Cliente, Agente o Supervisor | Archivo mayor a 5 MB | Intentar enviar ticket o comentario con archivo demasiado grande | El formulario bloquea el envio y muestra error controlado en pantalla, sin romper la pagina | Alta |
| QA-21 | Notificacion por comentario publico | Agente o Supervisor y luego Cliente | Comentario publico nuevo sobre ticket del cliente | Crear comentario publico y revisar el header del cliente | El cliente ve una notificacion reciente vinculada al ticket | Alta |
| QA-22 | Notificacion por cambio de estado | Agente o Supervisor y luego Cliente | Cambio de estado sobre ticket del cliente | Cambiar estado y revisar el header del cliente | El cliente ve una notificacion de cambio de estado | Alta |
| QA-23 | Notificacion por reasignacion al agente destino | Supervisor o Agente | Reasignar ticket a otro agente del mismo departamento | Reasignar y revisar el header del agente destino | El agente destino ve una notificacion de nuevo ticket asignado | Media |
| QA-24 | Vista de usuarios internos | Supervisor | Dataset bootstrap con agentes y supervisor | Abrir `/app/supervisor/users` | La vista responde, lista usuarios internos y no mezcla clientes | Alta |
| QA-25 | Actualizacion de departamento y estado de usuario | Supervisor | `diego.soporte@techsupport.local` | Cambiar departamento, luego inactivar y reactivar usuario | Los cambios se guardan y se reflejan en la UI | Alta |
| QA-26 | Validacion de agente sin departamento | Supervisor | Usuario interno con rol `agente` | Intentar guardar un agente con departamento vacio | Se muestra el error `Los agentes deben quedar asignados a un departamento.` | Alta |
| QA-27 | Resolucion con nota obligatoria y cierre por cliente | Agente o Supervisor, luego Cliente | Ticket en `in_progress` y luego `resolved` | Intentar resolver sin nota, luego resolver con nota; despues como cliente confirmar cierre sin motivo y luego con motivo valido | El sistema exige nota para `resolved` y exige motivo para `resolved -> closed` confirmado por cliente | Alta |
| QA-28 | Reapertura con motivo obligatorio | Cliente | Ticket en `resolved` | Intentar reabrir sin motivo y luego con motivo valido | El sistema bloquea reapertura incompleta y persiste el motivo cuando es valido | Alta |
| QA-29 | Cierre/Reapertura con opcion `otro` | Cliente | Ticket en `resolved` | Seleccionar `otro` como motivo al cerrar o reabrir, intentar guardar sin detalle y luego con detalle libre | El sistema exige detalle libre cuando se usa `otro` | Alta |
| QA-30 | Visibilidad de resolucion y reapertura | Cliente, Agente y Supervisor | Ticket cerrado y ticket reabierto con contexto | Abrir detalle del ticket por cada rol permitido | En ticket cerrado se muestran motivo de cierre y nota de resolucion; en ticket reabierto se muestra motivo de reapertura cuando exista | Alta |
| QA-31 | Ticket cerrado como estado final | Cliente, Agente y Supervisor | Ticket en `closed` | Abrir detalle del ticket por cada rol y revisar paneles de accion/comentario | El ticket cerrado no permite comentarios nuevos, reasignacion ni cambios de estado internos | Alta |
| QA-32 | Autocierre por vencimiento de ticket resuelto | Sistema, luego Cliente y Agente | Ticket en `resolved` con `resolved_at` vencido | Ejecutar `tickets:auto-close` y revisar ticket/notificaciones | El ticket cambia a `closed`, guarda motivo `sin_respuesta_cliente`, registra historial y notifica a cliente y agente | Alta |
| QA-33 | Exportacion CSV de tickets | Supervisor | Dashboard con dataset bootstrap | Abrir dashboard y descargar `Exportar tickets CSV` | Se descarga archivo CSV con encabezado valido y tickets reales | Media |
| QA-34 | Exportacion JSON de metricas | Supervisor | Dashboard con dataset bootstrap | Abrir dashboard y descargar `Descargar metricas JSON` | Responde JSON valido con `counts`, `agedTickets` y `generatedAt` | Media |
| QA-35 | Exportacion CSV filtrada de tickets | Supervisor | Vista `/app/supervisor/tickets` con filtros activos | Aplicar filtros y descargar `Exportar CSV filtrado` | El CSV descargado contiene solo tickets que cumplen los filtros activos | Alta |
| QA-36 | Exportacion CSV filtrada avanzada de tickets | Supervisor | Vista `/app/supervisor/tickets` con `departmentId`, `assignedToId`, `createdFrom` y `createdTo` | Aplicar filtros avanzados y descargar `Exportar CSV filtrado` | El CSV descargado contiene solo tickets del departamento, agente asignado y rango de fechas seleccionados; el filename refleja contexto de filtros avanzados | Alta |
| QA-37 | Dashboard KPI ampliado | Supervisor | Dashboard con dataset bootstrap | Abrir `/app/supervisor/dashboard` y revisar tarjetas y desgloses ampliados | Se muestran tasa de reapertura, tiempo promedio hasta `resolved`, tiempo promedio hasta `closed` y backlog envejecido por estado/departamento | Alta |
| QA-38 | Exportacion JSON KPI ampliado | Supervisor | Dashboard con dataset bootstrap | Descargar `Descargar metricas JSON` y revisar payload | El JSON incluye `reopenedRatePercent`, `averageTimeToResolvedHours`, `averageTimeToClosedHours`, `agedTicketsByStatus` y `agedTicketsByDepartment` | Alta |
| QA-39 | Resumen ejecutivo en dashboard | Supervisor | Dashboard con dataset operativo | Abrir `/app/supervisor/dashboard` y revisar bloque ejecutivo superior | Se muestra bloque `Resumen ejecutivo` con lectura gerencial, highlights y focos operativos, ademas del acceso `Descargar resumen gerencial` | Alta |
| QA-40 | Exportacion Markdown gerencial | Supervisor | Dashboard con dataset operativo | Descargar `Descargar resumen gerencial` | Se descarga archivo Markdown con encabezado ejecutivo, KPIs principales, highlights y focos operativos | Alta |
| QA-41 | Job run exitoso de autocierre | Sistema | Ticket `resolved` vencido y colecciones `job_runs`/`job_locks` disponibles | Ejecutar `tickets:auto-close` y revisar persistencia operativa | Se crea `job_run` en `success`, se registran conteos y no quedan locks activos | Alta |
| QA-42 | Lock activo en autocierre | Sistema | Lock activo existente para `tickets:auto-close` | Ejecutar `tickets:auto-close` durante lock vigente | La corrida queda en `skipped`, registra motivo de lock y no altera el lock activo | Alta |
| QA-43 | Dry-run de autocierre | Sistema | Ticket `resolved` vencido | Ejecutar `DRY_RUN=1 JOB_SOURCE=manual npm run tickets:auto-close` | El `job_run` queda en `success` sin cierres reales y el ticket sigue en `resolved` | Alta |
| QA-44 | Partial failure de autocierre | Sistema | Dos tickets `resolved` vencidos, uno con falla forzada | Ejecutar `tickets:auto-close` con falla controlada sobre un ticket | El `job_run` queda en `partial_failure`, al menos un ticket se cierra y el ticket forzado permanece en `resolved` con error resumido registrado | Alta |
| QA-45 | Health check operativo | Sistema | App, PocketBase y al menos una corrida previa de autocierre disponibles | Abrir `/api/health` | Responde `ok=true`, incluye `dependencies.pocketbase.ok=true`, `dependencies.jobs.autoClose`, `responseTimeMs`, `correlationId` y `timestamp` | Alta |
| QA-46 | Exportaciones con logging operativo | Supervisor | Dashboard y exportaciones supervisor disponibles | Descargar CSV de tickets, JSON de metricas y resumen gerencial | Las exportaciones siguen respondiendo correctamente despues de agregar logging operativo estructurado | Media |
| QA-50 | Paginas supervisor bloqueadas para cliente | Cliente | Sesion cliente valida | Intentar abrir `/app/supervisor/dashboard`, `/app/supervisor/tickets`, `/app/supervisor/users` y `/app/supervisor/departments` | El cliente no accede al contenido supervisor; el sistema redirige o bloquea segun la ruta | Alta |
| QA-51 | Paginas supervisor bloqueadas para agente | Agente | Sesion agente valida | Intentar abrir `/app/supervisor/dashboard`, `/app/supervisor/tickets`, `/app/supervisor/users` y `/app/supervisor/departments` | El agente no accede al contenido supervisor; el sistema redirige o bloquea segun la ruta | Alta |
| QA-52 | Exports supervisor bloqueados por rol | Cliente y Agente | Sesion valida no supervisor | Intentar consumir `/app/supervisor/exports/tickets`, `/app/supervisor/exports/metrics` y `/app/supervisor/exports/summary` | Todas las rutas responden `403` para roles no autorizados | Alta |
| QA-53 | Notificacion ajena no modificable | Cliente o Agente | Notificacion existente de otro usuario | Invocar `markNotificationReadAction` con `notificationId` ajeno | La accion no marca como leida la notificacion de otro usuario y no altera su estado | Alta |
| QA-54 | Backup local de PocketBase | Sistema | `pocketbase/pb_data` disponible | Ejecutar `npm run pb:backup` | Se crea respaldo en `backups/pocketbase/` con `manifest.json`, `data.db`, `auxiliary.db` y `storage/` | Alta |
| QA-55 | Restore check sin mutacion | Sistema | Respaldo existente en `backups/pocketbase/` | Ejecutar `PB_RESTORE_BACKUP_PATH=<ruta> npm run pb:restore:check` | El comando valida estructura del respaldo y no modifica `pocketbase/pb_data` | Alta |
| QA-56 | Restore protegido contra ejecucion accidental | Sistema | Respaldo existente en `backups/pocketbase/` | Ejecutar `PB_RESTORE_BACKUP_PATH=<ruta> npm run pb:restore` sin `PB_RESTORE_APPLY=1` | El comando no reemplaza `pb_data`, informa modo protegido y no crea snapshot de restore | Alta |
| QA-57 | Navegacion auth enriquecida | Visitante | App activa | Abrir `/login` y `/register` | Login muestra accesos a registro y recuperacion; register muestra acceso de regreso a login | Media |
| QA-58 | Solicitud de recuperacion de password | Visitante | Email registrado de cliente | Abrir `/forgot-password` y enviar email existente | El sistema procesa la solicitud con mensaje controlado sin exponer si el correo existe mas alla del flujo definido | Media |

## Nota de continuidad para Fase 4.6

- El autocierre de tickets resueltos fue separado como `Bloque 4.6`
- La cobertura automatizada actual para ese bloque vive en `QA-AUTO-23` y `QA-AUTO-24`

## Registro sugerido de ejecucion

Usar por caso:

- Estado: `Pendiente`, `OK`, `Fallo`, `Bloqueado`
- Fecha/hora de ejecucion
- Evidencia breve
- Observaciones

## Criterio de salida sugerido

- Todos los casos de prioridad `Alta` en `OK`
- Ningun fallo abierto en login, creacion de ticket, flujo de agente o gestion de departamentos
