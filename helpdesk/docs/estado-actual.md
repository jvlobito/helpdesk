# Estado Actual del Proyecto

## Fecha de corte

- 2026-04-09

## Estado general

- Fase 2: cerrada
- Fase 3: cerrada
- Fase 4: en curso
- Bloque actual: `4.5 Exportacion y analitica operativa ligera`

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
- `3042`

Nota operativa:
- evitar reutilizar procesos viejos de `start` cuando se quiera validar cambios recientes

## Documentos clave

- `docs/README.md`
- `docs/fase-2-cierre.md`
- `docs/fase-3-cierre.md`
- `docs/fase-4-cierre.md`
- `docs/fase-4-plan.md`
- `docs/fase-5-plan.md`
- `docs/bloque-basico-pruebas.md`
- `docs/matriz-qa-funcional.md`
- `docs/operacion-y-demo.md`
- `docs/reports/qa-verify-latest.md`

## Proximo paso recomendado

1. Revisar si `4.5` requiere filtros de exportacion o metricas descargables adicionales.
2. Si `4.5` ya cubre el minimo esperado, preparar cierre formal de Fase 4.
3. Mantener validacion por bloques igual que en fases anteriores.

## Nota de recuperacion de contexto

Si se pierde el historial del chat, este archivo debe leerse junto con `fase-4-cierre.md`, `fase-5-plan.md` y `matriz-qa-funcional.md` para retomar el trabajo sin depender de memoria conversacional.
