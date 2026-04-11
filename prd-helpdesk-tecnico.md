# PRD Tecnico - Sistema de Gestion de Tickets (Help Desk)

## 1. Objetivo Tecnico

Construir un sistema web de help desk que permita a clientes, agentes y supervisores operar el ciclo completo de tickets con autenticacion, control de acceso por rol, trazabilidad de cambios y visibilidad operativa basica.

El alcance de esta version corresponde a un MVP implementable por una sola persona.

## 2. Alcance del MVP

### 2.1 Incluido

1. Registro de clientes.
2. Inicio de sesion.
3. Control de acceso por rol: `cliente`, `agente`, `supervisor`.
4. Gestion basica de departamentos por supervisor.
5. Creacion de tickets por cliente.
6. Lista de tickets del cliente.
7. Vista de detalle del ticket.
8. Comentarios publicos e internos.
9. Flujo de estados del ticket.
10. Toma, asignacion y reasignacion de tickets.
11. Historial de cambios.
12. Busqueda y filtros basicos.
13. Paginacion.
14. Dashboard basico con metricas por recarga.

### 2.2 Fuera de alcance

1. Adjuntos.
2. Recuperacion de contrasena.
3. Rol `administrador`.
4. Auto-cierre automatico.
5. Tiempo real.
6. Notificaciones por email.
7. Exportacion CSV o PDF.
8. Chat.
9. Integraciones externas.

## 3. Stack Tecnologico

| Capa | Tecnologia |
|---|---|
| Frontend | Next.js App Router |
| Lenguaje | TypeScript |
| UI | shadcn/ui |
| Estilos | Tailwind CSS |
| Backend / BBDD | PocketBase |
| Formularios | React Hook Form |
| Validacion | Zod |
| Graficas | Recharts |

## 4. Arquitectura General

1. `Next.js` se usa para UI, rutas, layouts y acciones del cliente.
2. `PocketBase` se usa para autenticacion, persistencia de datos y reglas de acceso.
3. La logica de negocio debe quedar encapsulada en servicios o funciones del dominio, no dispersa en componentes de UI.
4. Las validaciones deben existir en frontend y backend.
5. Las reglas de seguridad deben aplicarse en PocketBase y tambien validarse desde la aplicacion.

## 5. Roles y Matriz de Permisos

| Accion | Cliente | Agente | Supervisor |
|---|---|---|---|
| Registrarse | Si | No | No |
| Iniciar sesion | Si | Si | Si |
| Crear ticket | Si | No | No |
| Ver sus tickets | Si | Si, si aplica | Si |
| Ver todos los tickets | No | No | Si |
| Ver tickets de su departamento sin asignar | No | Si | Si |
| Tomar ticket | No | Si | Si |
| Reasignar ticket | No | Si, dentro de reglas | Si |
| Cambiar estado | No | Si | Si |
| Comentar publico | Si | Si | Si |
| Comentar interno | No | Si | Si |
| Gestionar departamentos | No | No | Si |
| Ver dashboard | No | No | Si |
| Ver historial de cambios | Solo de sus tickets | Si | Si |

## 6. Modelo de Datos

### 6.1 Collection: users

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| id | string | Si | Autogenerado |
| email | email | Si | Unico |
| password | password | Si | Gestionado por auth |
| first_name | text | Si |  |
| last_name | text | Si |  |
| role | enum | Si | `cliente`, `agente`, `supervisor` |
| department_id | relation | No | Solo aplica para agente |
| active | bool | Si | Default `true` |
| created | datetime | Si | Autogenerado |
| updated | datetime | Si | Autogenerado |

### 6.2 Collection: departments

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| id | string | Si | Autogenerado |
| name | text | Si | Unico recomendado |
| description | text | No |  |
| contact_email | email | Si |  |
| active | bool | Si | Default `true` |
| created | datetime | Si | Autogenerado |
| updated | datetime | Si | Autogenerado |

### 6.3 Collection: tickets

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| id | string | Si | Autogenerado |
| ticket_number | text | Si | Unico |
| title | text | Si | Max 200 |
| description | text | Si |  |
| priority | enum | Si | `low`, `medium`, `high`, `critical` |
| category | enum | Si | `hardware`, `software`, `network`, `other` |
| status | enum | Si | `new`, `in_progress`, `waiting`, `resolved`, `reopened`, `closed` |
| department_id | relation | Si | A `departments` |
| created_by | relation | Si | A `users` |
| assigned_to | relation | No | A `users` |
| created | datetime | Si | Autogenerado |
| updated | datetime | Si | Autogenerado |
| closed_at | datetime | No | Solo si se cierra |

### 6.4 Collection: comments

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| id | string | Si | Autogenerado |
| ticket_id | relation | Si | A `tickets` |
| author_id | relation | Si | A `users` |
| content | text | Si |  |
| is_internal | bool | Si | Default `false` |
| created | datetime | Si | Autogenerado |

### 6.5 Collection: ticket_history

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| id | string | Si | Autogenerado |
| ticket_id | relation | Si | A `tickets` |
| field_changed | enum | Si | `status`, `priority`, `assigned_to` |
| old_value | text | No |  |
| new_value | text | No |  |
| changed_by | relation | Si | A `users` |
| changed_at | datetime | Si | Puede mapear a `created` |

## 7. Reglas de Negocio

1. Todo ticket debe pertenecer a un departamento.
2. Todo ticket se crea con estado `new`.
3. Todo ticket debe tener un `ticket_number` unico.
4. El cliente solo puede ver tickets creados por el mismo.
5. Los comentarios internos no son visibles para clientes.
6. Un agente solo puede tomar tickets sin asignar de su propio departamento.
7. Un agente solo puede reasignar tickets dentro de reglas definidas por negocio.
8. Todo cambio de `status`, `priority` o `assigned_to` debe generar un registro en `ticket_history`.
9. Un ticket en estado `closed` no debe aceptar nuevas transiciones salvo que negocio lo redefina en fases posteriores.
10. El dashboard del MVP se calcula bajo demanda al recargar la pagina.

## 8. Flujo de Estados

### 8.1 Estados

1. `new`
2. `in_progress`
3. `waiting`
4. `resolved`
5. `reopened`
6. `closed`

### 8.2 Transiciones validas

| Estado actual | Estado destino |
|---|---|
| `new` | `in_progress` |
| `in_progress` | `waiting` |
| `in_progress` | `resolved` |
| `waiting` | `in_progress` |
| `resolved` | `reopened` |
| `resolved` | `closed` |
| `reopened` | `in_progress` |

### 8.3 Reglas de transicion

1. `new -> in_progress` ocurre cuando un agente toma o recibe el ticket.
2. `resolved -> closed` en MVP se ejecuta manualmente.
3. No existe auto-cierre en MVP.
4. Toda transicion invalida debe responder con error funcional controlado.

## 9. Validaciones Funcionales

### 9.1 Registro

1. `email` obligatorio y unico.
2. `first_name` obligatorio.
3. `last_name` obligatorio.
4. `password` obligatoria.
5. Rol por defecto al registrarse: `cliente`.

### 9.2 Ticket

1. `title` obligatorio, maximo 200 caracteres.
2. `description` obligatoria.
3. `priority` obligatoria.
4. `category` obligatoria.
5. `department_id` obligatorio.
6. `ticket_number` autogenerado.

### 9.3 Comentario

1. `content` obligatorio.
2. `is_internal = true` solo permitido para `agente` y `supervisor`.

### 9.4 Departamento

1. `name` obligatorio.
2. `contact_email` obligatorio y valido.
3. `active` por defecto en `true`.

## 10. Reglas de Seguridad

1. Toda ruta protegida requiere sesion valida.
2. Toda consulta de tickets debe filtrarse por rol.
3. El cliente no debe poder consultar tickets ajenos por URL ni por query manual.
4. Los comentarios internos deben excluirse del resultado para clientes.
5. El supervisor puede ver todos los tickets.
6. El agente solo puede operar tickets de su contexto permitido.
7. Las validaciones de UI no sustituyen reglas de acceso en backend.
8. Los mensajes de error no deben exponer informacion sensible.

## 11. Reglas de Acceso Sugeridas en PocketBase

### 11.1 Users
1. El usuario puede leer su propio perfil.
2. El supervisor puede leer perfiles necesarios para operacion.
3. La escritura de rol no debe quedar abierta al cliente.

### 11.2 Departments
1. Lectura para usuarios autenticados.
2. Escritura solo para supervisor.

### 11.3 Tickets
1. Cliente: lectura de tickets donde `created_by = auth.id`.
2. Agente: lectura de tickets asignados a si mismo o tickets de su departamento segun regla definida.
3. Supervisor: lectura global.
4. Creacion: cliente autenticado.
5. Actualizacion: agente o supervisor segun permisos.

### 11.4 Comments
1. Cliente puede leer solo comentarios publicos de sus tickets.
2. Agente y supervisor pueden leer comentarios del ticket segun permiso operativo.
3. Cliente no puede crear comentarios internos.

### 11.5 Ticket History
1. Cliente puede leer historial de sus tickets.
2. Agente y supervisor pueden leer historial permitido.
3. Creacion solo por logica del sistema.

## 12. Rutas de Aplicacion Sugeridas

### 12.1 Publicas
1. `/login`
2. `/register`

### 12.2 Cliente
1. `/app/tickets`
2. `/app/tickets/[id]`
3. `/app/tickets/new`

### 12.3 Agente
1. `/app/agent/tickets`
2. `/app/agent/tickets/[id]`

### 12.4 Supervisor
1. `/app/supervisor/dashboard`
2. `/app/supervisor/tickets`
3. `/app/supervisor/tickets/[id]`
4. `/app/supervisor/departments`

## 13. Componentes Principales

1. `AuthForm`
2. `ProtectedRoute` o middleware de autenticacion
3. `TicketForm`
4. `TicketList`
5. `TicketFilters`
6. `TicketDetail`
7. `CommentList`
8. `CommentForm`
9. `StatusBadge`
10. `PriorityBadge`
11. `AssignmentPanel`
12. `DepartmentForm`
13. `DepartmentList`
14. `DashboardCards`
15. `DashboardCharts`

## 14. Servicios o Modulos de Dominio Sugeridos

1. `auth-service`
2. `ticket-service`
3. `comment-service`
4. `department-service`
5. `dashboard-service`
6. `history-service`
7. `permission-service`

## 15. Casos de Uso Tecnicos

### 15.1 Crear ticket

1. Cliente autenticado abre formulario.
2. Frontend valida campos con Zod.
3. Backend genera `ticket_number`.
4. Se persiste ticket con `status = new`.
5. Se devuelve confirmacion.
6. La lista `Mis Tickets` refleja el nuevo registro.

### 15.2 Tomar ticket

1. Agente consulta tickets sin asignar de su departamento.
2. Selecciona un ticket.
3. Backend valida departamento y estado permitido.
4. Actualiza `assigned_to`.
5. Cambia estado a `in_progress`.
6. Registra historial de asignacion y estado.

### 15.3 Agregar comentario interno

1. Agente abre detalle del ticket.
2. Ingresa comentario con `is_internal = true`.
3. Backend valida rol.
4. Persiste comentario.
5. Actualiza `updated` del ticket.

### 15.4 Cambiar estado

1. Agente o supervisor selecciona nuevo estado.
2. Backend valida transicion.
3. Actualiza ticket.
4. Registra historial.
5. Si el estado es `closed`, registra `closed_at`.

## 16. Busqueda, Filtros y Paginacion

### 16.1 Filtros minimos

1. `status`
2. `priority`
3. `category`
4. texto libre en `title` o `description`

### 16.2 Reglas

1. Los filtros deben combinarse.
2. La paginacion debe mantener filtros y busqueda.
3. Tamano de pagina fijo del MVP: `10`.
4. Orden por defecto sugerido: `updated desc`.

## 17. Dashboard Basico

### 17.1 Metricas requeridas

1. Conteo de tickets por estado.
2. Conteo de tickets por prioridad.
3. Conteo de tickets por departamento.
4. Lista de tickets abiertos por mas de 7 dias.

### 17.2 Reglas

1. El dashboard solo aplica a supervisor.
2. Los datos se recalculan al recargar.
3. No se requiere websocket ni polling.

## 18. Criterios de Aceptacion Tecnicos

### 18.1 Criterio general de salida del MVP

1. Todos los flujos principales deben funcionar sin depender de datos manuales ocultos.
2. Los permisos deben impedir acceso no autorizado por interfaz y por acceso directo.
3. Todo cambio clave debe quedar persistido y ser visible en la interfaz correspondiente.
4. Las pantallas principales deben ser usables en desktop y movil.
5. No deben existir errores bloqueantes en flujo de cliente, agente o supervisor.

### 18.2 Flujos obligatorios

1. Registro y login.
2. Crear ticket.
3. Ver tickets del cliente.
4. Ver detalle.
5. Comentar.
6. Tomar ticket.
7. Cambiar estado.
8. Reasignar ticket.
9. Ver dashboard basico.
10. Consultar historial.

## 19. Riesgos Tecnicos

1. Ambiguedad de permisos para agente en reasignacion.
2. Definicion futura del rol `administrador`.
3. Posible reapertura de alcance por `olvide mi contrasena`.
4. Riesgo de inconsistencias si el historial no se centraliza.
5. Riesgo de fuga de comentarios internos si las reglas de acceso quedan incompletas.
6. Riesgo de estimacion baja si se agregan extras al MVP.

## 20. Dudas Abiertas

1. El supervisor podra editar roles de usuario en fase 2 o solo gestionar departamentos.
2. La reasignacion de agente podra hacerse a cualquier agente o solo dentro del mismo departamento.
3. El cierre manual de ticket podra hacerlo agente y supervisor o solo supervisor.
4. Habra migracion inicial de tickets desde correo o Excel.
5. El `ticket_number` se generara por secuencia global o por secuencia anual.

## 21. Orden Recomendado de Implementacion

1. Modelo de datos y colecciones PocketBase.
2. Autenticacion y roles.
3. Middleware de proteccion de rutas.
4. Departamentos.
5. Creacion de tickets.
6. Listado y detalle de tickets.
7. Comentarios.
8. Cambio de estado.
9. Asignacion y reasignacion.
10. Historial de cambios.
11. Filtros y paginacion.
12. Dashboard basico.
13. Pruebas manuales de flujos.

## 22. Estimacion

Para una sola persona:

1. Base tecnica y autenticacion: `4 a 6 horas`
2. Tickets, comentarios y estados: `7 a 10 horas`
3. Asignacion, historial y permisos: `4 a 6 horas`
4. Filtros, paginacion y dashboard: `3 a 4 horas`

Estimacion total MVP: `18 a 26 horas`
