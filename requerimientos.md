# Requerimientos Consolidados del MVP - Sistema Help Desk

## 1. Proposito del documento

Este documento consolida y depura la informacion de `problemas.md`, `prd-helpdesk.md` y `prd-helpdesk-tecnico.md` para definir un conjunto de requerimientos claros, priorizados y orientados al MVP.

Su objetivo es servir como entrada mas util para planificacion y ejecucion del proyecto, reduciendo el sesgo a solucion tecnica y separando:
- problema de negocio
- alcance funcional del MVP
- restricciones y criterios de aceptacion
- dudas abiertas que no deben asumirse como cerradas

## 2. Problema de negocio

La organizacion gestiona solicitudes de soporte mediante correos electronicos y hojas de calculo, lo que provoca perdida de solicitudes, duplicacion de esfuerzos, baja trazabilidad, poca visibilidad para clientes y ausencia de metricas operativas para supervisores.

El negocio necesita una forma estructurada de registrar, asignar, seguir y controlar incidencias entre clientes y equipo interno para mejorar la coordinacion operativa, reducir errores, proteger la informacion y dar visibilidad del estado de cada solicitud.

## 3. Objetivo del producto

Construir un sistema web de help desk que permita a clientes, agentes y supervisores operar el ciclo completo de tickets con autenticacion, control de acceso por rol, trazabilidad de cambios y visibilidad operativa basica.

## 4. Objetivos del MVP

- Centralizar las solicitudes de soporte en un solo sistema.
- Permitir que el cliente registre y consulte sus tickets.
- Permitir que agentes y supervisores gestionen tickets bajo reglas claras.
- Mantener historial de cambios y comentarios para trazabilidad.
- Dar a supervisores visibilidad operativa basica con metricas de recarga.

## 5. Actores principales

- Cliente: crea tickets, consulta sus tickets, revisa detalle y agrega comentarios publicos.
- Agente: toma tickets de su departamento, cambia estado, comenta, reasigna dentro de reglas permitidas.
- Supervisor: tiene visibilidad global, puede gestionar departamentos, tickets y dashboard.

## 6. Principios de alcance

- Este documento define un MVP implementable por una sola persona.
- Cuando `prd-helpdesk.md` y `prd-helpdesk-tecnico.md` entran en conflicto, prevalece el alcance reducido del PRD tecnico para el MVP.
- Las capacidades no resueltas o contradictorias se mantienen como dudas abiertas, no como requerimientos cerrados.

## 7. Requerimientos funcionales del MVP

### RF-01. Registro de clientes

El sistema debe permitir el registro de usuarios cliente.

Criterios:
- El registro solicita al menos `email`, `first_name`, `last_name` y `password`.
- `email` debe ser obligatorio y unico.
- El rol asignado al registrarse debe ser `cliente` por defecto.
- El registro no debe permitir que un cliente se autoasigne roles privilegiados.

### RF-02. Inicio de sesion y acceso protegido

El sistema debe permitir a usuarios autenticados iniciar sesion y acceder solo a las rutas y acciones permitidas para su rol.

Criterios:
- Deben existir rutas publicas para login y registro.
- Toda ruta protegida requiere sesion valida.
- La interfaz debe redirigir o bloquear acceso no autorizado por rol.
- La proteccion no debe depender solo de validaciones de interfaz; tambien debe existir en backend.

### RF-03. Roles y permisos del MVP

El sistema debe soportar los roles `cliente`, `agente` y `supervisor`.

Criterios:
- El cliente puede crear tickets, ver solo sus tickets, ver su historial permitido y comentar en sus tickets.
- El agente puede ver tickets asignados a si mismo y tickets no asignados de su departamento segun regla operativa.
- El agente puede tomar tickets, cambiar estado, comentar y reasignar dentro de reglas permitidas.
- El supervisor puede ver todos los tickets, gestionar departamentos, operar tickets y ver dashboard.

### RF-04. Gestion basica de departamentos

El sistema debe permitir a supervisores crear y administrar departamentos basicos.

Criterios:
- Un departamento debe tener `name`, `description` opcional, `contact_email` y `active`.
- Solo el supervisor puede crear o editar departamentos.
- Todo ticket debe pertenecer a un departamento.
- La lectura de departamentos debe estar disponible para usuarios autenticados que lo requieran para operar.

### RF-05. Creacion de tickets por cliente

El sistema debe permitir que un cliente autenticado cree tickets de soporte.

Criterios:
- Un ticket debe incluir `title`, `description`, `priority`, `category` y `department`.
- `title` es obligatorio y con maximo de 200 caracteres.
- `description`, `priority`, `category` y `department` son obligatorios.
- El sistema genera un `ticket_number` unico.
- Todo ticket nuevo se crea con estado `new`.
- Todo ticket nuevo queda asignado automaticamente al departamento seleccionado.
- El ticket queda asociado al usuario creador y aparece en la lista de sus tickets.

### RF-06. Listado de tickets del cliente

El sistema debe permitir que un cliente consulte la lista de tickets creados por el mismo.

Criterios:
- La lista muestra al menos `ticket_number`, `title`, `status`, `priority`, `created` y `updated`.
- El cliente no puede ver tickets de otros usuarios por URL ni por manipulacion manual de consultas.
- La lista soporta filtros basicos y paginacion.

### RF-07. Vista de detalle del ticket

El sistema debe permitir visualizar el detalle completo del ticket segun el rol y permisos del usuario.

Criterios:
- La vista muestra datos principales del ticket, comentarios y cambios relevantes.
- El cliente solo puede abrir tickets propios.
- Agente y supervisor pueden ver informacion del ticket segun su contexto operativo.
- Los comentarios internos no deben ser visibles para clientes.

### RF-08. Comentarios publicos e internos

El sistema debe permitir comentarios asociados a tickets.

Criterios:
- El comentario requiere `content`.
- Clientes, agentes y supervisores pueden agregar comentarios publicos.
- Solo agentes y supervisores pueden crear comentarios internos.
- Los comentarios internos deben excluirse del resultado visible para clientes.
- Al crear un comentario, el ticket debe reflejar actividad reciente.

### RF-09. Flujo de estados del ticket

El sistema debe soportar el flujo de estados definido para el MVP.

Estados:
- `new`
- `in_progress`
- `waiting`
- `resolved`
- `reopened`
- `closed`

Transiciones validas del MVP:
- `new -> in_progress`
- `in_progress -> waiting`
- `in_progress -> resolved`
- `waiting -> in_progress`
- `resolved -> reopened`
- `resolved -> closed`
- `reopened -> in_progress`

Criterios:
- Toda transicion invalida debe responder con error funcional controlado.
- `new -> in_progress` ocurre cuando un agente toma o recibe el ticket.
- `resolved -> closed` es manual en el MVP.
- Un ticket `closed` no debe aceptar nuevas transiciones dentro del MVP.

### RF-10. Toma, asignacion y reasignacion de tickets

El sistema debe permitir operar la asignacion de tickets con reglas basicas.

Criterios:
- La asignacion inicial del ticket corresponde al departamento seleccionado al momento de crearlo.
- Un agente puede tomar tickets sin asignar de su propio departamento.
- Tomar un ticket actualiza `assigned_to` y cambia el estado a `in_progress`.
- Un supervisor o un agente con permisos operativos puede asignar o reasignar tickets a agentes especificos segun las reglas del MVP.
- El supervisor puede asignar y reasignar tickets.
- La reasignacion de agente debe respetar reglas de negocio definidas para el MVP.
- Toda accion de asignacion o reasignacion debe quedar registrada en historial.

### RF-11. Historial de cambios

El sistema debe registrar cambios relevantes del ticket para asegurar trazabilidad.

Criterios:
- Todo cambio de `status`, `priority` o `assigned_to` genera un registro de historial.
- El historial guarda al menos campo modificado, valor anterior, valor nuevo, usuario y fecha.
- El cliente puede consultar el historial permitido de sus tickets.
- Agente y supervisor pueden consultar historial de tickets dentro de su contexto.

### RF-12. Busqueda, filtros y paginacion

El sistema debe permitir localizar tickets mediante filtros y busqueda basica.

Criterios:
- Deben existir filtros minimos por `status`, `priority` y `category`.
- Debe existir busqueda por texto libre sobre `title` o `description`.
- Los filtros deben poder combinarse.
- La paginacion debe conservar filtros y busqueda.
- El tamano de pagina del MVP es `10`.
- El orden por defecto sugerido es por `updated` descendente.

### RF-13. Dashboard basico para supervisor

El sistema debe mostrar visibilidad operativa basica para el supervisor.

Criterios:
- El dashboard es visible solo para supervisor.
- Debe mostrar conteo de tickets por estado.
- Debe mostrar conteo de tickets por prioridad.
- Debe mostrar conteo de tickets por departamento.
- Debe mostrar lista de tickets abiertos por mas de 7 dias.
- Los datos se recalculan al recargar la pagina; no requiere tiempo real.

## 8. Requerimientos no funcionales del MVP

### RNF-01. Seguridad

- Toda ruta protegida requiere sesion valida.
- Toda consulta de tickets debe filtrarse por rol.
- El cliente no debe poder consultar tickets ajenos por acceso directo.
- Los mensajes de error no deben exponer informacion sensible.
- Las validaciones de interfaz no sustituyen reglas de acceso en backend.

### RNF-02. Usabilidad

- Las pantallas principales deben ser usables en desktop y movil.
- La interfaz debe dar feedback claro al crear tickets, comentar o cambiar estado.
- Los errores funcionales deben mostrarse de forma controlada y comprensible.

### RNF-03. Trazabilidad y consistencia

- Todo cambio clave del ticket debe persistirse correctamente.
- El historial no debe depender de implementaciones dispersas o manuales.
- La informacion visible en detalle, listas e historial debe ser consistente con el estado real del ticket.

### RNF-04. Mantenibilidad tecnica

- La logica de negocio no debe quedar dispersa en componentes de UI.
- Deben existir validaciones en frontend y backend.
- El codigo debe ser modular y entendible para permitir evolucion posterior del producto.

## 9. Fuera de alcance del MVP

Quedan explicitamente fuera del MVP actual:

- Adjuntos.
- Recuperacion de contrasena.
- Rol `administrador`.
- Auto-cierre automatico.
- Tiempo real.
- Notificaciones por email.
- Exportacion CSV o PDF.
- Chat.
- Integraciones externas.
- Modo oscuro.

## 10. Criterios generales de aceptacion del MVP

- Los flujos principales deben funcionar sin depender de datos manuales ocultos.
- Los permisos deben impedir acceso no autorizado por interfaz y por acceso directo.
- Todo cambio clave debe quedar persistido y ser visible donde corresponda.
- No deben existir errores bloqueantes en los flujos de cliente, agente o supervisor.

Flujos obligatorios del MVP:
- Registro y login.
- Crear ticket.
- Ver tickets del cliente.
- Ver detalle del ticket.
- Comentar.
- Tomar ticket.
- Cambiar estado.
- Reasignar ticket.
- Ver dashboard basico.
- Consultar historial.

## 11. Supuestos operativos para poder construir el MVP

Estos supuestos permiten avanzar sin expandir alcance:

- El MVP se enfoca en clientes, agentes y supervisores; no se implementa administracion completa de usuarios.
- La asignacion inicial de agentes y supervisores puede depender de configuracion operativa o carga inicial de datos fuera del registro publico.
- La reasignacion de tickets se implementara con una regla minima segura y consistente con el departamento mientras no exista una definicion mas detallada.
- El cierre de tickets en el MVP sera manual.

## 12. Dudas abiertas que deben mantenerse visibles

- Si el supervisor podra editar roles de usuario en una fase posterior o solo gestionar departamentos.
- Si la reasignacion de tickets podra hacerse a cualquier agente o solo a agentes del mismo departamento.
- Si el cierre manual de tickets podra hacerlo agente y supervisor o solo supervisor.
- Si existira migracion inicial de tickets desde correo o Excel.
- Si `ticket_number` usara secuencia global o anual.

## 13. Decision de consolidacion usada en este documento

Para mantener un MVP realista y coherente:

- Se conservaron los problemas de negocio y objetivos del `prd-helpdesk.md`.
- Se adopto el alcance reducido y mas implementable de `prd-helpdesk-tecnico.md`.
- Se excluyeron del MVP capacidades que el PRD funcional proponia pero el PRD tecnico dejaba fuera, especialmente adjuntos, recuperacion de contrasena y auto-cierre.
- Se mantuvieron las ambiguedades importantes como dudas abiertas en lugar de convertirlas en features obligatorias.
