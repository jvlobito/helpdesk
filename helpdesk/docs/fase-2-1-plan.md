# Plan Ejecutable - Fase 2.1 Consistencia de Datos y Reglas

## Objetivo

Eliminar inconsistencias entre schema, backend y UI para que el sistema opere sobre datos confiables, con actividad real, numeracion estable y reglas cerradas de cierre manual.

## Decisiones ya congeladas

- `ticket_number`: secuencia global
- cierre manual: agente y supervisor
- reasignacion: solo mismo departamento

## Problemas concretos a resolver

1. La app todavia tiene workarounds por falta de timestamps consistentes.
2. La numeracion actual depende del anio y contradice la decision de secuencia global.
3. La actividad del ticket no se actualiza de forma centralizada al comentar o mutar el caso.
4. El cierre manual ya funciona por transicion, pero no esta consolidado como regla explicitamente documentada y alineada en schema/backend/UI.
5. El dashboard y las listas todavia no pueden ordenar por actividad real de forma confiable.

## Alcance de Fase 2.1

Incluye:
- normalizacion de timestamps en colecciones clave
- actualizacion centralizada de actividad del ticket
- implementacion de `ticket_number` global
- consolidacion de regla de cierre manual por agente y supervisor
- ajuste de queries y mapeos para usar datos consistentes
- actualizacion de bootstrap y datos semilla si hace falta

No incluye:
- filtros y paginacion reales
- gestion de departamentos desde UI
- mensajes de exito tipo toast
- mejoras visuales amplias

## Tareas ejecutables

### Tarea 1. Definir estrategia de timestamps consistente

Objetivo:
Definir un contrato estable de fechas para `tickets`, `comments`, `departments` y `ticket_history`.

Trabajo:
1. Revisar como PocketBase expone timestamps de sistema vs campos custom.
2. Decidir si usar:
   - campos sistema `created` / `updated`, o
   - campos custom explicitos para actividad
3. Documentar la decision en `docs/pocketbase-schema.md`.

Salida esperada:
- decision cerrada de modelado temporal
- esquema objetivo claro

### Tarea 2. Ajustar bootstrap/schema

Objetivo:
Que las colecciones creadas por bootstrap reflejen la decision de timestamps y actividad real.

Trabajo:
1. Modificar `scripts/bootstrap-pocketbase.mjs`.
2. Asegurar que `tickets` tenga soporte claro para:
   - `created`
   - `updated`
   - `closed_at`
3. Asegurar que `comments` y `departments` tengan timestamps utilizables.
4. Verificar si `ticket_history` usara `changed_at` como fuente principal y mantenerlo consistente.
5. Reejecutar bootstrap en entorno local y revisar compatibilidad con datos existentes.

Archivos impactados:
- `scripts/bootstrap-pocketbase.mjs`
- `docs/pocketbase-schema.md`

Salida esperada:
- schema consistente y reproducible

### Tarea 3. Implementar `ticket_number` global

Objetivo:
Cambiar la generacion para que deje de depender del anio.

Trabajo:
1. Actualizar `src/app/app/tickets/new/actions.ts`.
2. Reemplazar formato actual dependiente de `TKT-YYYY-NNNNN` por secuencia global estable.
3. Definir formato final recomendado:
   - sugerencia: `TKT-00001`, `TKT-00002`, etc.
4. Revisar seed de datos para alinearlo al nuevo formato o definir compatibilidad temporal minima.

Archivos impactados:
- `src/app/app/tickets/new/actions.ts`
- `scripts/bootstrap-pocketbase.mjs`
- `docs/pocketbase-schema.md`

Salida esperada:
- nuevos tickets con numeracion global coherente

### Tarea 4. Centralizar actualizacion de actividad del ticket

Objetivo:
Que cualquier accion relevante impacte la actividad visible del ticket.

Trabajo:
1. Definir helper compartido para tocar actividad del ticket.
2. Invocarlo desde:
   - creacion de comentario
   - toma de ticket
   - cambio de estado
   - reasignacion
3. Evitar logica duplicada en acciones dispersas.

Archivos impactados:
- `src/app/app/tickets/[id]/comment-actions.ts`
- `src/app/app/tickets/[id]/workflow-actions.ts`
- posible helper nuevo en `src/lib/`

Salida esperada:
- el ticket refleja actividad real despues de cada operacion clave

### Tarea 5. Consolidar cierre manual para agente y supervisor

Objetivo:
Hacer explicita la regla ya decidida y alinear backend y UI.

Trabajo:
1. Verificar que agente y supervisor pueden ejecutar `resolved -> closed`.
2. Asegurar que el backend no lo bloquee por rol.
3. Confirmar que `closed_at` se persiste siempre al cerrar.
4. Confirmar que el historial registra el cierre.
5. Ajustar copys o hints de UI si hace falta.

Archivos impactados:
- `src/app/app/tickets/[id]/workflow-actions.ts`
- `src/components/tickets/ticket-workflow-form.tsx`
- documentacion de reglas si aplica

Salida esperada:
- regla de cierre manual alineada y verificable

### Tarea 6. Simplificar queries y mapeos de servidor

Objetivo:
Eliminar workarounds temporales y volver a una lectura coherente basada en datos reales.

Trabajo:
1. Revisar `src/lib/helpdesk-server.ts`.
2. Reemplazar ordenaciones por `ticket_number` donde ya corresponda por ordenacion de actividad real si el schema lo permite.
3. Revisar `formatMaybeDate` y reducir su uso defensivo donde ya haya timestamps garantizados.
4. Verificar dashboard, detalle y listados.

Archivos impactados:
- `src/lib/helpdesk-server.ts`
- pantallas que usan `updatedAt` y `createdAt`

Salida esperada:
- datos y ordenaciones coherentes con el modelo final de Fase 2.1

### Tarea 7. Validacion tecnica y funcional

Objetivo:
Cerrar el bloque con verificacion real.

Trabajo:
1. Ejecutar `npm run pb:bootstrap`.
2. Ejecutar `npm run lint`.
3. Ejecutar `npm run build`.
4. Validar manualmente:
   - crear ticket
   - comentar
   - tomar ticket
   - cambiar estado a `closed` como agente y supervisor
   - verificar historial
   - verificar dashboard y ordenacion

Salida esperada:
- bloque listo para pasar a Fase 2.2

## Orden de implementacion recomendado

1. Tarea 1. Estrategia de timestamps
2. Tarea 2. Bootstrap/schema
3. Tarea 3. `ticket_number` global
4. Tarea 4. Actualizacion de actividad
5. Tarea 5. Cierre manual
6. Tarea 6. Queries y mapeos
7. Tarea 7. Validacion final

## Riesgos y mitigaciones

### Riesgo 1. Cambios de schema rompen datos semilla
Mitigacion:
- mantener bootstrap idempotente
- probar en local antes de tocar mas capas

### Riesgo 2. Numeracion global rompe expectativas visuales existentes
Mitigacion:
- documentar formato nuevo
- adaptar seeds y vistas en el mismo bloque

### Riesgo 3. Actividad real toca demasiadas acciones dispersas
Mitigacion:
- crear helper compartido y no repetir update manual en cada archivo

## Criterio de salida de Fase 2.1

- schema y app alineados en timestamps
- `ticket_number` global implementado
- actividad del ticket actualizada tras acciones clave
- agente y supervisor pueden cerrar manualmente con historial y `closed_at`
- dashboard y listados ya no dependen de workarounds por datos faltantes
