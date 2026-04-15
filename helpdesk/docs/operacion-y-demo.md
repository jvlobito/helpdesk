# Guia Operativa y Demo

## Objetivo

Tener una guia corta para levantar el MVP, entrar con usuarios de prueba y recorrer una demo funcional sin depender de contexto previo.

## Preparacion recomendada

1. Ejecutar `npm run pb:bootstrap`
2. Ejecutar `npm run build`
3. Ejecutar `npm run start -- --port 3020`
4. Abrir `http://127.0.0.1:3020`

## Usuarios de demo

- Cliente: `cliente@acme.com / ChangeMe123!`
- Agente IT: `ana.agente@techsupport.local / ChangeMe123!`
- Agente IT 2: `diego.soporte@techsupport.local / ChangeMe123!`
- Supervisor: `supervisor@techsupport.local / ChangeMe123!`

## Flujo sugerido de demo

### 1. Cliente

1. Iniciar sesion como cliente.
2. Ir a `Mis tickets`.
3. Crear un ticket nuevo.
4. Confirmar mensaje de exito.
5. Abrir el detalle.
6. Agregar comentario publico.

Puntos a remarcar:
- numeracion global de tickets
- visibilidad solo de tickets propios
- feedback claro en acciones

### 2. Agente

1. Cerrar sesion.
2. Iniciar sesion como agente.
3. Abrir `Cola agente`.
4. Buscar el ticket creado por el cliente.
5. Tomar el ticket.
6. Cambiar estado.
7. Agregar comentario interno.

Puntos a remarcar:
- el agente solo opera tickets de su contexto
- el comentario interno no es visible al cliente
- la actividad del ticket se actualiza

### 3. Supervisor

1. Cerrar sesion.
2. Iniciar sesion como supervisor.
3. Abrir `Dashboard`.
4. Revisar carga por agente, alertas y metricas por estado/prioridad/departamento.
5. Abrir `Tickets`.
6. Revisar el ticket creado en vista global.
7. Abrir `Departamentos` y crear o editar uno.

Puntos a remarcar:
- visibilidad global
- gestion de departamentos
- metricas basadas en datos reales

## Comandos utiles de verificacion

- `npm run lint`
- `npm run build`
- `npm run qa:verify`

## Operacion basica de autocierre

Para ejecucion manual controlada del job:

- corrida normal: `npm run tickets:auto-close`
- corrida identificada como scheduler: `JOB_SOURCE=scheduler npm run tickets:auto-close`
- inspeccion segura sin mutacion: `DRY_RUN=1 JOB_SOURCE=manual npm run tickets:auto-close`
- revisar ultimo resultado persistido: `npm run tickets:auto-close:last-run`

Checklist corto:

1. Verificar que el ultimo `job_run` tenga `status = success` o `status = skipped` esperado.
2. Si aparece `partial_failure` o `failed`, revisar `errorSummary`.
3. Confirmar que no existan locks huerfanos si una corrida anterior quedo interrumpida.

## Continuidad minima de PocketBase

Comandos base:

- generar respaldo local: `npm run pb:backup`
- verificar respaldo sin mutar datos activos: `PB_RESTORE_BACKUP_PATH=<ruta-del-respaldo> npm run pb:restore:check`
- restore controlado: `PB_RESTORE_BACKUP_PATH=<ruta-del-respaldo> PB_RESTORE_APPLY=1 npm run pb:restore`

Procedimiento minimo recomendado:

1. Ejecutar `npm run pb:backup`.
2. Confirmar que el respaldo nuevo exista en `backups/pocketbase/backup-<timestamp>/`.
3. Verificar que el respaldo contenga `manifest.json`, `data.db`, `auxiliary.db` y `storage/`.
4. Ejecutar `PB_RESTORE_BACKUP_PATH=<ruta-del-respaldo> npm run pb:restore:check` antes de cualquier restore real.

Restore controlado recomendado:

1. Detener PocketBase o cualquier proceso que use `pocketbase/pb_data`.
2. Crear un respaldo fresco adicional con `npm run pb:backup`.
3. Validar el respaldo objetivo con `pb:restore:check`.
4. Ejecutar `PB_RESTORE_BACKUP_PATH=<ruta-del-respaldo> PB_RESTORE_APPLY=1 npm run pb:restore` solo en una ventana controlada.
5. Confirmar que el comando haya creado un `pre-restore-snapshot-<timestamp>` en `backups/pocketbase/`.
6. Levantar nuevamente el entorno y validar `/api/health` y `npm run qa:verify` si aplica.

## Diagnostico rapido de observabilidad

1. Ejecutar `GET /api/health` y revisar:
   - `ok`
   - `dependencies.pocketbase.ok`
   - `dependencies.jobs.autoClose`
   - `responseTimeMs`
   - `correlationId`
2. Si el problema es una exportacion de supervisor, repetir la accion y buscar el `correlationId` en logs operativos.
3. Si el problema es autocierre, revisar `npm run tickets:auto-close:last-run` antes de tocar datos manualmente.
4. Si hay dudas sobre proceso viejo, levantar build fresca en puerto nuevo y repetir la validacion.

## Evidencia automatizada

Tras ejecutar `npm run qa:verify` revisar:

- `docs/reports/qa-verify-latest.md`

Ese archivo deja evidencia automatizada de accesos por rol, filtros, comentarios internos, guardrails de acceso, departamentos y cierre manual.
