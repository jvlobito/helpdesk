# Plan de Implementacion MVP

## Objetivo

Construir un sistema web de help desk para clientes, agentes y supervisores con autenticacion, control de acceso por rol, trazabilidad y visibilidad operativa basica.

## Stack adoptado

- Next.js 16 con App Router
- TypeScript
- Tailwind CSS 4
- PocketBase
- Zod
- React Hook Form
- Recharts

## Entregables ya sembrados

- Rutas publicas: `/`, `/login`, `/register`
- Workspace base: `/app`
- Rutas cliente: `/app/tickets`, `/app/tickets/new`, `/app/tickets/[id]`
- Rutas agente: `/app/agent/tickets`, `/app/agent/tickets/[id]`
- Rutas supervisor: `/app/supervisor/dashboard`, `/app/supervisor/tickets`, `/app/supervisor/tickets/[id]`, `/app/supervisor/departments`
- Helper de PocketBase en `src/lib/pocketbase.ts`
- Datos de dominio y restricciones MVP en `src/lib/helpdesk.ts`
- Endpoint tecnico: `/api/health`

## Fases recomendadas

### Fase 1. Base tecnica y autenticacion

- Configurar instancia PocketBase local
- Crear colecciones `users`, `departments`, `tickets`, `comments`, `ticket_history`
- Implementar registro cliente y login
- Implementar proteccion de rutas por sesion y rol

### Fase 2. Tickets y comentarios

- Persistir creacion de tickets con `ticket_number` unico
- Reemplazar datos de ejemplo por queries reales
- Implementar detalle de ticket y comentarios publicos/internos
- Actualizar `updated` del ticket ante nueva actividad

### Fase 3. Flujo operativo

- Implementar toma, asignacion y reasignacion
- Centralizar validacion de transiciones de estado
- Registrar historial para `status`, `priority` y `assigned_to`
- Asegurar filtrado por rol en backend

### Fase 4. Visibilidad y cierre MVP

- Implementar filtros y paginacion en tablas
- Conectar dashboard del supervisor a datos reales
- Ejecutar pruebas manuales de los flujos obligatorios
- Refinar feedback visual y errores funcionales

## Decisiones de modelado

- El scaffold sigue el alcance consolidado de `requerimientos.md`, no el alcance extendido del PRD original.
- No se incluyen adjuntos, recuperacion de contrasena, tiempo real ni notificaciones.
- La UI actual es base navegable y no reemplaza validaciones ni permisos en backend.

## Dudas abiertas a mantener visibles

- Regla final de reasignacion entre agentes
- Quien puede cerrar tickets en el MVP
- Estrategia final de `ticket_number`
- Alcance de administracion de usuarios en una fase posterior
