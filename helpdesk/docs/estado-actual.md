# Estado Actual del Proyecto

## Fecha de corte

- 2026-04-16

## Corte de sesion

- Punto de corte actual: cierre formal completado hasta `Fase 6` y cierre final del bloque post entrega de auth publica
- Siguiente paso recomendado al retomar: definir si existe una nueva fase posterior al roadmap actual o si solo habra mejoras puntuales post entrega
- Ultimo build fresco validado: `http://127.0.0.1:3068`
- Ultimo reporte automatizado valido: `docs/reports/qa-verify-latest.md`

## Estado general

- Fase 2: cerrada
- Fase 3: cerrada
- Fase 4: cerrada
- Fase 5: cerrada
- Fase 6: cerrada
- Bloque actual: `Roadmap actual completado`

## Estado por bloque de Fase 5

### Bloque 5.1. Exportacion filtrada

- Estado: cerrado en segunda iteracion
- Implementado:
  - exportacion CSV filtrada desde la vista global del supervisor
  - soporte para `status`, `priority`, `category` y `q`
  - extension por `departmentId`, `assignedToId`, `createdFrom` y `createdTo`
  - nombre de archivo con contexto minimo de filtros activos
- Validacion actual:
  - tecnica OK con `npm run lint` y `npm run build`
  - automatica OK en `qa:verify` para `QA-AUTO-27` y `QA-AUTO-28`
  - validacion dirigida OK para `QA-35` y `QA-36`

### Bloque 5.2. KPIs ampliados del dashboard

- Estado: cerrado en primera iteracion
- Implementado:
  - `tasa de reapertura` visible en dashboard de supervisor
  - separacion de `tiempo promedio hasta resolved` y `tiempo promedio hasta closed`
  - desglose de backlog envejecido por `estado` y por `departamento`
  - exportacion JSON de metricas ampliada con esos nuevos campos
- Validacion actual:
  - tecnica OK con `npm run lint` y `npm run build`
  - automatica OK en `qa:verify` para `QA-AUTO-29` y `QA-AUTO-30`
  - validacion dirigida prevista con `QA-37` y `QA-38`

### Bloque 5.3. Salida gerencial resumida

- Estado: cerrado en primera iteracion
- Implementado:
  - bloque visual `Resumen ejecutivo` en dashboard de supervisor
  - descarga `Descargar resumen gerencial` en formato Markdown
  - highlights y focos operativos construidos sobre los KPIs ampliados de 5.2
  - resumen ejecutivo expuesto tambien dentro del JSON de metricas
- Validacion actual:
  - tecnica OK con `npm run lint` y `npm run build`
  - automatica OK en `qa:verify` para `QA-AUTO-31` y `QA-AUTO-32`
  - validacion dirigida prevista con `QA-39` y `QA-40`

## Estado por bloque de Fase 6

### Bloque 6.1. Scheduler y jobs confiables

- Estado: cerrado en primer corte
- Implementado:
  - colecciones `job_runs` y `job_locks`
  - `tickets:auto-close` con `JOB_SOURCE`, `DRY_RUN` y estados operativos persistidos
  - helper `npm run tickets:auto-close:last-run`
  - cobertura automatizada de `success`, `skipped`, `dry-run` y `partial_failure`
- Validacion actual:
  - tecnica OK con `npm run pb:bootstrap`, `npm run lint` y `npm run build`
  - automatica OK en `qa:verify` para `QA-AUTO-33`, `QA-AUTO-34`, `QA-AUTO-35` y `QA-AUTO-36`
  - validacion dirigida prevista con `QA-41`, `QA-42`, `QA-43` y `QA-44`

### Bloque 6.2. Observabilidad operativa

- Estado: cerrado en primer corte
- Implementado:
  - `/api/health` con verificacion real de PocketBase
  - `correlationId` en health y exportaciones supervisor
  - resumen compacto del ultimo `job_run` de `tickets:auto-close` dentro de health
  - logs estructurados en exportaciones supervisor
  - playbook corto de diagnostico rapido
- Validacion actual:
  - tecnica OK con `npm run lint` y `npm run build`
  - automatica OK en `qa:verify` para `QA-AUTO-37` y `QA-AUTO-38`
  - validacion dirigida prevista con `QA-45` y `QA-46`

### Bloque 6.3. Rendimiento y consultas

- Estado: cerrado en primer corte
- Implementado:
  - primer corte iniciado con paginacion real en backend para listados de cliente, agente y supervisor
  - `listAllSupervisorTickets()` reservado para exportaciones y agregados full dataset
  - dashboard consume conteos precalculados en servidor por estado, prioridad y departamento
  - `getSupervisorDashboardData()` reduce fan-out usando mapas y conteos reutilizables en una sola pasada
- Validacion actual:
  - tecnica OK con `npm run pb:bootstrap`, `npm run lint` y `npm run build`
  - automatica OK en `qa:verify` sin regresiones sobre listados, exportaciones y dashboard
  - validacion dirigida prevista con `QA-47`, `QA-48` y `QA-49`

### Bloque 6.4. Seguridad operativa

- Estado: cerrado en primer corte
- Implementado:
  - guardas explicitas de rol en paginas supervisor
  - exports supervisor bloqueados a cliente y agente con `403`
  - accion `markNotificationReadAction()` endurecida con revalidacion de propiedad del recurso
  - cobertura automatizada para accesos indebidos a paginas supervisor, exports supervisor y notificaciones ajenas
- Validacion actual:
  - tecnica OK con `npm run pb:bootstrap`, `npm run lint` y `npm run build`
  - automatica OK en `qa:verify` para `QA-AUTO-41`, `QA-AUTO-42`, `QA-AUTO-43` y `QA-AUTO-44`
  - validacion dirigida prevista con `QA-50`, `QA-51`, `QA-52` y `QA-53`
- Riesgo residual principal:
  - aun no existe una auditoria formal separada de reglas PocketBase contra cada accion sensible, aunque las superficies mas expuestas ya quedaron endurecidas

### Bloque 6.5. Continuidad y recuperacion

- Estado: cerrado en primer corte
- Implementado:
  - script `npm run pb:backup` para respaldo local de `pocketbase/pb_data`
  - script `npm run pb:restore:check` para verificar un respaldo sin mutar datos activos
  - script `npm run pb:restore` con confirmacion explicita y snapshot previo de restore
  - guia operativa minima documentada en `operacion-y-demo.md`
- Validacion actual:
  - respaldo local validado y repetido por `qa:verify`
  - `npm run pb:restore:check` OK sobre respaldo generado
  - `npm run pb:restore` protegido contra aplicacion accidental sin `PB_RESTORE_APPLY=1`

## Estado posterior a Fase 6

- El roadmap actual del MVP base se considera completo.
- La mejora post entrega de auth publica y recuperacion de password tambien queda cerrada.
- No existe aun una `Fase 7` definida dentro del marco documental.
- Cualquier continuacion requiere decidir si se abre una nueva fase de evolucion del producto.

## Estado por bloque de Fase 4

### Bloque 4.1. Adjuntos en tickets y comentarios

- Estado: cerrado
- Implementado:
  - adjuntos opcionales en ticket y comentario
  - visualizacion de adjuntos en detalle
  - validacion de tamano y cantidad
- Validado:
  - adjunto valido visible en detalle
  - comentario interno oculto para cliente
  - error controlado para archivo mayor a 5 MB
  - automatica OK en `qa:verify` para ticket con adjunto, comentario con adjunto y archivo mayor a 5 MB

### Bloque 4.2. Notificaciones operativas

- Estado: cerrado en primera iteracion
- Implementado:
  - feed de notificaciones recientes en header
  - notificaciones internas para comentario publico, ticket tomado, cambio de estado y reasignacion
  - `href` adaptado al rol destinatario
- Validado:
  - cliente recibe notificaciones operativas
  - agente destino recibe notificacion de ticket asignado/reasignado
  - automatica OK en `qa:verify` para comentario publico, cambio de estado y reasignacion al agente destino
  - el panel ahora puede abrirse/cerrarse y permite marcar notificaciones como revisadas para ocultarlas de pendientes

### Bloque 4.3. Administracion operativa de usuarios

- Estado: cerrado en primera iteracion
- Implementado:
  - vista `/app/supervisor/users`
  - listado de usuarios internos
  - actualizacion de `role`, `department` y `active`
  - validacion para impedir agentes sin departamento
- Validacion actual:
  - automatica OK en `qa:verify` para vista, actualizacion valida y validacion de agente sin departamento
  - validacion manual OK con `QA-24`, `QA-25`, `QA-26`

### Bloque 4.4. Cierre y seguimiento mejorado de tickets

- Estado: cerrado en primera iteracion
- Implementado:
  - nota de resolucion obligatoria al pasar a `resolved`
  - motivo de cierre obligatorio cuando el cliente confirma `resolved -> closed`
  - motivo de reapertura obligatorio cuando el cliente solicita `resolved -> reopened`
  - catalogos con opcion `otro` y detalle libre obligatorio cuando aplica
  - bloque `Seguimiento de cierre` visible en detalle para cliente, agente y supervisor
- Validacion actual:
  - tecnica OK con `npm run lint` y `npm run build`
  - validacion funcional OK para `QA-27`, `QA-28`, `QA-29` y `QA-30`
  - automatica OK en `qa:verify` para resolucion con nota obligatoria, cierre/reapertura por cliente, motivo `otro` y visibilidad por rol
  - se ajusto la UX para que agente/supervisor resuelvan y el cliente confirme cierre o reapertura desde `resolved`
  - corregido el falso error de UI cuando el cliente cerraba o reabria y el cambio ya habia persistido en BD

### Bloque 4.5. Exportacion y analitica operativa ligera

- Estado: cerrado en primera iteracion
- Implementado:
  - exportacion CSV de tickets para supervisor
  - descarga JSON de metricas operativas basicas desde dashboard
  - accesos directos desde `/app/supervisor/dashboard`
- Validacion actual:
  - tecnica OK con `npm run lint` y `npm run build`
  - validacion dirigida OK para dashboard supervisor, export CSV y export JSON en `3042`

### Bloque 4.6. Autocierre de tickets resueltos

- Estado: cerrado en primera iteracion
- Implementado:
  - campo `resolved_at` para tickets resueltos
  - script batch `npm run tickets:auto-close`
  - autocierre con motivo `sin_respuesta_cliente`
  - historial y notificaciones al cliente y al agente asignado
  - ticket `closed` tratado como estado final sin comentarios, reasignacion ni nuevas transiciones internas
- Validacion actual:
  - tecnica OK con `npm run lint` y `npm run build`
  - automatica OK en `qa:verify` para estado final `closed` y autocierre por vencimiento
  - validacion dirigida OK para `QA-31` y `QA-32`

## Decisiones operativas vigentes

- `ticket_number` usa secuencia global
- ciclo de vida vigente: `new -> in_progress -> waiting -> in_progress -> resolved -> (reopened | closed)` y `reopened -> in_progress`
- `closed` es estado final
- el agente asignado atiende el ticket hasta dejarlo en `resolved`
- el cliente decide el cierre final o la reapertura cuando el ticket esta en `resolved`
- reasignacion solo dentro del mismo departamento
- el ticket nace asignado al departamento, no necesariamente a un agente
- el agente puede ver tickets asignados a el y tickets no asignados de su departamento segun la regla vigente
- comentarios publicos de agente/supervisor son visibles para cliente
- comentarios internos no son visibles para cliente
- notificaciones de Fase 4.2 son internas en la app, no email

## Gap abierto contra requerimiento original

- El `PRD` original define `resolved -> closed` despues de `48h` o confirmacion del cliente.
- La implementacion vigente del MVP ya adopta confirmacion del cliente para `resolved -> closed` y `resolved -> reopened`.
- La implementacion vigente si respeta que `closed` es final y que `resolved -> reopened` es la unica reapertura valida.
- La implementacion vigente ya incluye autocierre batch por tiempo usando `tickets:auto-close`.

## Dataset de prueba actual

Usuarios clave:
- `supervisor@techsupport.local / ChangeMe123!`
- `ana.agente@techsupport.local / ChangeMe123!`
- `diego.soporte@techsupport.local / ChangeMe123!`
- `cliente@acme.com / ChangeMe123!`

Notas:
- ya existe un segundo agente en `Soporte TI` para validar reasignacion real
- usar `npm run pb:bootstrap` para restaurar dataset base

## Validacion y comandos utiles

Comandos base:
- `npm run pb:bootstrap`
- `npm run lint`
- `npm run build`
- `npm run qa:verify`

Ultimo puerto fresco usado en validaciones recientes:
- `3063`

Nota operativa:
- evitar reutilizar procesos viejos de `start` cuando se quiera validar cambios recientes

## Documentos clave

- `docs/README.md`
- `docs/fase-2-cierre.md`
- `docs/fase-3-cierre.md`
- `docs/fase-4-cierre.md`
- `docs/fase-4-plan.md`
- `docs/fase-5-plan.md`
- `docs/fase-5-cierre.md`
- `docs/fase-6-plan.md`
- `docs/fase-6.1-cierre.md`
- `docs/fase-6.2-cierre.md`
- `docs/fase-6.3-cierre.md`
- `docs/fase-6.4-cierre.md`
- `docs/fase-6.5-cierre.md`
- `docs/fase-6-cierre.md`
- `docs/roadmap.md`
- `docs/bloque-basico-pruebas.md`
- `docs/matriz-qa-funcional.md`
- `docs/operacion-y-demo.md`
- `docs/reports/qa-verify-latest.md`

## Proximo paso recomendado

1. Decidir si se abre una nueva fase posterior al roadmap actual.
2. Si se continua, hacerlo ya como expansion del producto y no como cierre del MVP base.
3. Mantener validacion por bloques igual que en fases anteriores.

## Punto de reanudacion sugerido

Al retomar, leer en este orden:

1. `docs/estado-actual.md`
2. `docs/fase-6.3-cierre.md`
3. `docs/fase-6-plan.md`
4. `docs/qa-trazabilidad.md`
5. `docs/reports/qa-verify-latest.md`

## Nota de recuperacion de contexto

Si se pierde el historial del chat, este archivo debe leerse junto con `fase-6-cierre.md`, `roadmap.md` y `matriz-qa-funcional.md` para retomar el trabajo sin depender de memoria conversacional.
