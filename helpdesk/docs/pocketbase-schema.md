# PocketBase esperado para Fase 1

## Objetivo

Este documento deja definido el esquema minimo esperado en PocketBase para que la Fase 1 del MVP funcione con autenticacion real y base operativa para las fases siguientes.

## Coleccion auth: `users`

Tipo:
- Auth collection

Campos base de PocketBase:
- `email`
- `password`
- `verified`

Campos custom esperados:

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `first_name` | text | Si | Nombre del usuario |
| `last_name` | text | Si | Apellido del usuario |
| `role` | select | Si | `cliente`, `agente`, `supervisor` |
| `department_id` | relation | No | Solo aplica a agentes |
| `active` | bool | Si | Default `true` |

Reglas esperadas:
- Create: permitir registro publico solo para clientes o gestionar desde logica segura del backend.
- Update: no permitir que el cliente modifique su `role` libremente.
- List/View: el usuario puede leer su propio perfil; el supervisor puede leer perfiles necesarios para operacion.

Notas operativas:
- El formulario publico del proyecto crea solo usuarios con rol `cliente`.
- Los usuarios `agente` y `supervisor` deben cargarse desde el panel admin de PocketBase o via proceso administrativo controlado.

## Coleccion: `departments`

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `name` | text | Si | Unico recomendado |
| `description` | text | No | Descripcion operativa |
| `contact_email` | email | Si | Contacto del departamento |
| `active` | bool | Si | Default `true` |
| `created_at` | date | No | Fecha de alta operativa |
| `updated_at` | date | No | Fecha de ultima actualizacion |

Reglas esperadas:
- View/List: autenticados.
- Create/Update/Delete: solo supervisor.

## Coleccion: `tickets`

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `ticket_number` | text | Si | Unico |
| `title` | text | Si | Max 200 |
| `description` | text | Si | Descripcion del problema |
| `priority` | select | Si | `low`, `medium`, `high`, `critical` |
| `category` | select | Si | `hardware`, `software`, `network`, `other` |
| `status` | select | Si | `new`, `in_progress`, `waiting`, `resolved`, `reopened`, `closed` |
| `close_reason` | select | No | Motivo formal de cierre |
| `close_reason_detail` | text | No | Detalle libre cuando se elige `otro` |
| `resolution_note` | text | No | Nota formal de resolucion visible en detalle |
| `reopen_reason` | select | No | Motivo formal de reapertura |
| `reopen_reason_detail` | text | No | Detalle libre cuando se elige `otro` |
| `department_id` | relation | Si | Relacion a `departments` |
| `created_by` | relation | Si | Relacion a `users` |
| `assigned_to` | relation | No | Relacion a `users` |
| `attachments` | file | No | Hasta 3 archivos de apoyo por ticket |
| `closed_at` | date | No | Solo cuando cierre |
| `created_at` | date | No | Fecha de creacion operativa |
| `updated_at` | date | No | Fecha de ultima actividad |

Reglas esperadas:
- Cliente: crear y leer tickets donde `created_by = auth.id`.
- Agente: leer tickets asignados a si mismo o tickets de su departamento segun reglas operativas.
- Supervisor: lectura global y actualizacion operativa.

Notas operativas:
- `ticket_number` usa secuencia global.
- `updated_at` debe tocarse ante comentario, toma, cambio de estado o reasignacion.
- `closed_at` se completa cuando un agente o supervisor ejecuta el cierre manual.

## Coleccion: `comments`

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `ticket_id` | relation | Si | Relacion a `tickets` |
| `author_id` | relation | Si | Relacion a `users` |
| `content` | text | Si | Comentario |
| `is_internal` | bool | Si | Default `false` |
| `attachments` | file | No | Hasta 3 archivos por comentario |
| `created_at` | date | No | Fecha de creacion operativa |
| `updated_at` | date | No | Fecha de ultima actualizacion |

Reglas esperadas:
- Cliente: solo comentarios publicos de sus tickets.
- Agente y supervisor: segun contexto operativo.

## Coleccion: `ticket_history`

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `ticket_id` | relation | Si | Relacion a `tickets` |
| `field_changed` | select | Si | `status`, `priority`, `assigned_to` |
| `old_value` | text | No | Valor previo |
| `new_value` | text | No | Valor nuevo |
| `changed_by` | relation | Si | Relacion a `users` |
| `changed_at` | date | Si | Fecha de cambio |

## Usuarios semilla sugeridos para pruebas manuales

Crear manualmente en PocketBase al menos:

| Rol | Email sugerido | Requisitos |
|---|---|---|
| `supervisor` | `supervisor@techsupport.local` | `active=true` |
| `agente` | `ana.agente@techsupport.local` | `active=true`, `department_id` definido |
| `agente` | `diego.soporte@techsupport.local` | `active=true`, mismo `department_id` de `Soporte TI` para validar reasignacion |
| `cliente` | `cliente@acme.com` | `active=true` |

## Estado de integracion en la app

Ya implementado en Fase 1:
- Registro real de clientes.
- Login real con cookie de sesion PocketBase.
- Proteccion basica de `/app` por sesion y rol.

Pendiente para siguientes fases:
- Persistencia real de tickets, comentarios e historial.
- Reglas completas de acceso en backend.
- Transiciones de estado e historial centralizado.
