# Plan Detallado - Fase 6

## Objetivo de la fase

Endurecer la operacion del MVP para hacerlo mas confiable, observable y mantenible en uso sostenido, sin expandir de forma significativa el alcance funcional visible de negocio.

## Principio rector de Fase 6

Reducir riesgo operativo real: menos dependencia de ejecucion manual, mejor visibilidad ante fallos, mejor control sobre rendimiento, seguridad y recuperacion.

## Alcance propuesto

### 6.1 Operacion robusta de jobs batch

#### Objetivo
Evitar que procesos como autocierre dependan solo de ejecucion manual o contexto del operador.

#### Alcance sugerido
- estrategia clara para ejecucion programada de jobs
- trazabilidad basica de corridas batch
- idempotencia y proteccion ante doble ejecucion
- salidas de error y resultado mas auditables

#### Valor
- reduce riesgo de omision operativa
- mejora confianza en procesos temporizados

#### Primer corte recomendado
- registrar inicio, fin y resultado de `tickets:auto-close`
- definir mecanismo minimo de programacion operativa
- documentar politica de frecuencia, retries y verificacion manual

### 6.2 Observabilidad y soporte operativo

#### Objetivo
Facilitar diagnostico rapido cuando algo falla en app, exports o jobs.

#### Alcance sugerido
- logs mas utiles y consistentes para server actions, routes y jobs
- identificadores de correlacion o contexto minimo por operacion critica
- health checks y señales operativas mas completas
- guia de diagnostico rapido para errores comunes

#### Valor
- reduce tiempo de investigacion
- mejora soporte y recuperacion ante incidencias

#### Primer corte recomendado
- estructurar logs de exports, dashboard y autocierre
- ampliar health check con dependencias criticas
- documentar playbook operativo minimo

### 6.3 Rendimiento y consultas operativas

#### Objetivo
Controlar el costo de crecimiento de listados, dashboard y exportaciones.

#### Alcance sugerido
- revision de consultas que hoy cargan listas completas
- reduccion de trabajo redundante en dashboard y exportaciones
- validacion de limites practicos de dataset y tiempos de respuesta
- indices o ajustes de acceso si son realmente necesarios

#### Valor
- evita degradacion temprana de la experiencia
- prepara el MVP para mayor volumen operativo

#### Primer corte recomendado
- medir costo de `listAllSupervisorTickets` y vistas derivadas
- detectar puntos con mayor fan-out o recomputo
- corregir los cuellos mas evidentes antes de escalar alcance

### 6.4 Seguridad operativa y permisos avanzados

#### Objetivo
Reforzar controles ya existentes para reducir errores de exposicion o abuso.

#### Alcance sugerido
- revision de reglas PocketBase y superficies sensibles
- validacion de exports y descargas para evitar filtrado indebido
- endurecimiento de acciones privilegiadas del supervisor
- mejores mensajes/control en fallos de autorizacion

#### Valor
- reduce riesgo de acceso indebido o fuga accidental
- mejora confianza operativa del sistema

#### Primer corte recomendado
- auditar rutas supervisor y scripts batch
- revisar caminos alternos de acceso por URL y descargas
- registrar decisiones de seguridad residual y backlog

### 6.5 Backup, recuperacion y continuidad operativa

#### Objetivo
Tener una base minima de continuidad ante errores, corrupcion o perdida de datos.

#### Alcance sugerido
- politica de respaldo de PocketBase y archivos adjuntos
- pasos claros de restauracion basica
- checklist de recuperacion despues de incidente
- documentacion operativa para entorno local/demo y entornos mas persistentes

#### Valor
- reduce impacto de fallos severos
- mejora previsibilidad operativa

#### Primer corte recomendado
- documentar backup y restore minimo viable
- probar restauracion basica en entorno controlado
- definir frecuencia y responsable operativo

## Bloques ejecutables sugeridos

### Bloque 6.1. Scheduler y jobs confiables

#### Objetivo
Formalizar ejecucion programada y segura de procesos batch.

#### Alcance minimo
- corrida programada o claramente orquestable de autocierre
- log de ejecucion
- proteccion contra doble corrida accidental

#### Primer corte ejecutable
- agregar coleccion `job_runs` para registrar inicio, fin y resultado de cada corrida
- agregar coleccion `job_locks` para evitar doble ejecucion simultanea del mismo job
- extender `tickets:auto-close` con `DRY_RUN`, `JOB_SOURCE` y estados `success`, `partial_failure`, `failed`, `skipped`
- mantener el entrypoint actual del script para no romper la operacion existente
- dejar documentado el contrato minimo de scheduler externo

#### Diseño recomendado
- `job_runs` persiste metadatos operativos: nombre del job, fuente de disparo, timestamps, cutoff, conteos y resumen de error
- `job_locks` protege por `job_name` con expiracion simple para evitar solapamientos accidentales
- el job debe ser idempotente: si una corrida se repite, solo procesa tickets que sigan siendo candidatos
- la programacion debe quedar fuera de Next y resolverse por scheduler del entorno (`cron`, Task Scheduler o equivalente)

#### Tareas ejecutables sugeridas
1. Crear colecciones PocketBase `job_runs` y `job_locks` con schema minimo viable.
2. Refactorizar `scripts/auto-close-resolved.mjs` para crear y cerrar `job_runs`.
3. Implementar adquisicion y liberacion de lock con expiracion.
4. Agregar modo `DRY_RUN=1` sin mutacion de tickets.
5. Registrar conteos de candidatos, procesados, cerrados, omitidos y errores.
6. Documentar frecuencia sugerida, source del job y verificacion operativa basica.

#### Contrato operativo minimo
- scheduler recomendado: externo al proceso Next (`cron`, Windows Task Scheduler o equivalente)
- frecuencia sugerida inicial: cada `1 hora`
- comando base: `npm run tickets:auto-close`
- source recomendado para scheduler: `JOB_SOURCE=scheduler npm run tickets:auto-close`
- verificacion manual segura: `DRY_RUN=1 JOB_SOURCE=manual npm run tickets:auto-close`
- politica de reintento: no reintentar en loop dentro del script; dejar que la siguiente corrida programada procese pendientes
- politica de lock: una sola corrida activa por `job_name`; si existe lock vigente, la nueva corrida debe quedar en `skipped`

#### Checklist operativo diario
1. Revisar el ultimo `job_run` de `tickets:auto-close`.
2. Confirmar `status` distinto de `failed`.
3. Si hubo `partial_failure`, revisar `error_summary` y cantidad de errores.
4. Confirmar que no existan locks activos huerfanos en `job_locks`.
5. Si se requiere inspeccion segura, ejecutar `DRY_RUN=1 JOB_SOURCE=manual npm run tickets:auto-close`.

#### Señales operativas esperadas
- `success`: corrida completa sin errores
- `partial_failure`: algunos tickets se procesaron y otros fallaron
- `failed`: no se pudo completar la corrida
- `skipped`: habia lock activo o la corrida fue omitida por control operativo

#### Casos QA del bloque
- `QA-41`: corrida exitosa de autocierre registra `job_run` y libera lock
- `QA-42`: corrida con lock activo queda marcada como `skipped`
- `QA-43`: `DRY_RUN` no modifica tickets candidatos
- `QA-44`: corrida con falla controlada queda en `partial_failure` y mantiene pendientes los tickets no procesados

#### Cobertura automatizada esperada
- `QA-AUTO-33`: autocierre registra corrida `success` con conteos y lock liberado
- `QA-AUTO-34`: lock activo evita segunda corrida y deja `job_run` en `skipped`
- `QA-AUTO-35`: `DRY_RUN` conserva ticket en `resolved` y registra corrida sin cierres reales
- `QA-AUTO-36`: autocierre con falla controlada registra `partial_failure`, cierra tickets validos y deja el ticket forzado en `resolved`

### Bloque 6.2. Observabilidad operativa

#### Objetivo
Hacer mas facil entender fallos y estado de salud del sistema.

#### Alcance minimo
- logs mas estructurados
- health check ampliado
- guia corta de soporte y diagnostico

#### Estado del primer corte
- cerrado
- `/api/health` ya verifica conectividad real contra PocketBase y devuelve `dependencies`, `responseTimeMs` y `timestamp`
- exportaciones supervisor emiten logs operativos estructurados en success y error
- health y exportaciones supervisor ya incluyen `correlationId` para seguimiento operativo basico
- `/api/health` ya resume el ultimo `job_run` de `tickets:auto-close` con senal compacta de estado operativo

#### Playbook corto de diagnostico
1. Ejecutar `GET /api/health` y revisar `ok`, `dependencies.pocketbase.ok`, `dependencies.jobs.autoClose`, `responseTimeMs` y `correlationId`.
2. Si `ok=false`, validar primero disponibilidad de PocketBase antes de revisar UI.
3. Si una exportacion falla, buscar en logs el `event` correspondiente y usar `correlationId` para unir intento y error.
4. Si el problema viene de autocierre, revisar `npm run tickets:auto-close:last-run` y luego `job_runs`/`job_locks`.
5. Si el fallo no se reproduce, ejecutar de nuevo sobre build fresca y puerto nuevo para descartar proceso viejo.

#### Casos QA del bloque
- `QA-45`: health endpoint refleja estado real de dependencia PocketBase, tiempo de respuesta y senal compacta del ultimo autocierre
- `QA-46`: exportaciones supervisor mantienen respuesta correcta despues de agregar logging operativo

#### Cobertura automatizada esperada
- `QA-AUTO-37`: `/api/health` responde `ok=true` con `dependencies.pocketbase.ok=true`, `responseTimeMs`, `correlationId` y resumen del ultimo `job_run` de autocierre
- `QA-AUTO-38`: exportaciones supervisor siguen respondiendo correctamente tras agregar logging operativo

### Bloque 6.3. Rendimiento y consultas

#### Objetivo
Reducir riesgo de lentitud en dashboard, vistas globales y exportaciones.

#### Alcance minimo
- medicion de tiempos base
- correccion de puntos de mayor costo
- evidencia de mejora o al menos limites conocidos

#### Primer corte cerrado
- migrar vistas paginadas de tickets a `getList(page, perPage, ...)` en lugar de `getFullList()` con paginacion en memoria
- reservar el camino `listAllSupervisorTickets()` para exportaciones y agregados que realmente requieren dataset completo
- validar que cliente, agente y supervisor mantengan paginacion funcional equivalente
- precalcular en servidor los conteos basicos del dashboard por estado, prioridad y departamento
- reducir el fan-out de `getSupervisorDashboardData()` construyendo mapas y conteos reutilizables en una sola pasada

#### Casos QA del bloque
- `QA-47`: paginacion cliente conserva navegacion y total de paginas tras usar backend paginado
- `QA-48`: paginacion agente conserva navegacion y total de paginas tras usar backend paginado
- `QA-49`: paginacion supervisor conserva navegacion y exportacion completa tras separar camino paginado de camino full export

#### Cobertura automatizada esperada
- `QA-AUTO-39`: cliente, agente y supervisor mantienen paginacion correcta con consultas paginadas reales
- `QA-AUTO-40`: exportacion supervisor sigue devolviendo dataset completo y no solo la pagina visible

### Bloque 6.4. Seguridad operativa

#### Objetivo
Revisar y reforzar permisos y superficies sensibles.

#### Alcance minimo
- auditoria de rutas y exports de supervisor
- revision de reglas PocketBase criticas
- cierre de hallazgos de mayor riesgo

#### Primer corte cerrado
- endurecer guardas explicitas de rol en paginas supervisor
- verificar que exports supervisor respondan `403` a roles no autorizados
- validar accesos directos por URL a pantallas supervisor desde cliente y agente
- revalidar propiedad del recurso dentro de acciones sensibles aunque ya exista regla PocketBase

#### Estado actual del bloque
- cerrado en primer corte
- paginas supervisor ya validan rol de forma explicita
- exports supervisor ya responden `403` a cliente y agente
- `markNotificationReadAction` ya ignora `notificationId` ajeno y revalida propiedad del recurso en la accion

#### Casos QA del bloque
- `QA-50`: cliente es redirigido o bloqueado al intentar abrir paginas supervisor
- `QA-51`: agente es redirigido o bloqueado al intentar abrir paginas supervisor
- `QA-52`: cliente y agente reciben `403` al intentar consumir exports supervisor
- `QA-53`: accion de notificacion no modifica registros ajenos aunque reciba un `notificationId` de otro usuario

#### Cobertura automatizada esperada
- `QA-AUTO-41`: cliente no accede a dashboard ni vistas supervisor por URL directa
- `QA-AUTO-42`: agente no accede a dashboard ni vistas supervisor por URL directa
- `QA-AUTO-43`: exports supervisor devuelven `403` a cliente y agente
- `QA-AUTO-44`: `markNotificationReadAction` ignora `notificationId` ajeno y solo permite marcar notificaciones propias

### Bloque 6.5. Continuidad y recuperacion

#### Objetivo
Preparar respaldo y recuperacion minima viable.

#### Alcance minimo
- procedimiento de backup
- procedimiento de restore
- checklist operativo de continuidad

#### Primer corte recomendado
- script local de backup para `pocketbase/pb_data`
- validacion segura de restore sin mutar datos por defecto
- guia operativa para ejecutar backup, verificar respaldo y restaurar de forma controlada
- snapshot previo automatico antes de restore real

#### Estado actual del bloque
- cerrado en primer corte
- `npm run pb:backup` ya genera respaldo local reproducible bajo `backups/pocketbase/`
- `npm run pb:restore:check` ya valida un respaldo sin mutar `pocketbase/pb_data`
- `npm run pb:restore` ya exige `PB_RESTORE_APPLY=1` y crea snapshot previo antes de reemplazar `pb_data`
- existe evidencia local validada de backup y restore-check sobre `backup-2026-04-15T03-39-27-486Z`

#### Casos QA del bloque
- `QA-54`: backup local genera copia valida de `pb_data` con manifiesto
- `QA-55`: restore en modo verificacion valida estructura del respaldo sin mutar `pb_data`
- `QA-56`: restore sin `PB_RESTORE_APPLY=1` no muta datos activos y devuelve mensaje de seguridad

#### Cobertura automatizada esperada
- `QA-AUTO-45`: `pb:backup` genera respaldo en `backups/pocketbase/` con `manifest.json` y `data.db`
- `QA-AUTO-46`: `pb:restore:check` valida un respaldo existente sin mutar el directorio activo
- `QA-AUTO-47`: `pb:restore` no aplica restore accidental si falta `PB_RESTORE_APPLY=1`

## Fuera de alcance de Fase 6

- nuevas funcionalidades de negocio mayores
- nuevos dashboards analiticos complejos
- automatizacion completa estilo plataforma DevOps
- rediseño visual amplio sin objetivo operativo

## Orden recomendado de implementacion en Fase 6

1. Bloque 6.1. Scheduler y jobs confiables
2. Bloque 6.2. Observabilidad operativa
3. Bloque 6.3. Rendimiento y consultas
4. Bloque 6.4. Seguridad operativa
5. Bloque 6.5. Continuidad y recuperacion

## Criterios de salida sugeridos

- jobs criticos pueden operarse sin depender de memoria manual del equipo
- existe visibilidad suficiente para diagnosticar fallos comunes
- dashboard y exportaciones tienen comportamiento aceptable bajo mayor carga
- permisos sensibles fueron revisados y reforzados
- existe capacidad minima documentada de backup y restauracion

## Riesgos a vigilar

- convertir la fase en refactor tecnico abierto sin criterio de salida claro
- sobrediseñar infraestructura mas alla de la necesidad real del MVP
- introducir complejidad operativa sin automatizacion o documentacion suficiente

## Direccion recomendada

Fase 6 debe concentrarse en confiabilidad operativa. Si aparecen nuevas ideas funcionales o analiticas, deben diferirse salvo que desbloqueen directamente un riesgo operativo concreto.
