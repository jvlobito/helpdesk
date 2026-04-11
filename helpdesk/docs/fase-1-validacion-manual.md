# Validacion Manual - Fase 1

## Preparacion

Servicios requeridos:
- PocketBase en `http://127.0.0.1:8090`
- App en modo produccion en `http://127.0.0.1:3010`

Comandos utiles:
- `npm run pb:bootstrap`
- `npm run build`
- `npm run start`

## Usuarios de prueba

- Supervisor: `supervisor@techsupport.local / ChangeMe123!`
- Agente IT: `ana.agente@techsupport.local / ChangeMe123!`
- Agente Campo: `mario.campo@techsupport.local / ChangeMe123!`
- Cliente: `cliente@acme.com / ChangeMe123!`

## Checklist de Fase 1

### 1. Auth y proteccion de rutas

1. Abrir `http://127.0.0.1:3010/app` sin sesion.
2. Verificar redireccion a `/login`.
3. Iniciar sesion como cliente.
4. Verificar redireccion a `/app/tickets`.
5. Cerrar sesion.
6. Iniciar sesion como agente.
7. Verificar redireccion a `/app/agent/tickets`.
8. Cerrar sesion.
9. Iniciar sesion como supervisor.
10. Verificar redireccion a `/app/supervisor/dashboard`.

Resultado esperado:
- Cada rol aterriza en su vista operativa.
- Un usuario no autenticado no accede a `/app`.

### 2. Cliente crea ticket

1. Iniciar sesion como `cliente@acme.com`.
2. Ir a `/app/tickets/new`.
3. Crear un ticket con:
   - titulo: `Validacion Fase 1 - Ticket nuevo`
   - prioridad: `high`
   - categoria: `software`
   - departamento: `Soporte TI`
   - descripcion: `Prueba de creacion real desde interfaz.`
4. Enviar formulario.
5. Verificar regreso a `/app/tickets`.
6. Confirmar que el nuevo ticket aparece en la lista.

Resultado esperado:
- El ticket se guarda con estado `new`.
- Solo aparece en la lista del cliente creador.

### 3. Cliente comenta en su ticket

1. Abrir el detalle del ticket creado.
2. Agregar un comentario publico.
3. Verificar que aparece en el detalle.

Resultado esperado:
- El comentario se persiste.
- No existe opcion de comentario interno para cliente.

### 4. Agente toma ticket

1. Cerrar sesion e iniciar como `ana.agente@techsupport.local`.
2. Abrir la cola de agente.
3. Buscar un ticket `new` del departamento `Soporte TI`.
4. Abrir el detalle.
5. Usar `Tomar ticket`.

Resultado esperado:
- `assigned_to` cambia al agente autenticado.
- `status` cambia a `in_progress`.
- El historial muestra cambio de asignacion y estado.

### 5. Agente cambia estado

1. Desde el mismo ticket asignado al agente.
2. Cambiar de `in_progress` a `waiting` o `resolved`.

Resultado esperado:
- Solo se permiten transiciones validas.
- El historial muestra el cambio de `status`.

### 6. Agente reasigna

1. Desde un ticket asignado al agente actual.
2. Usar el formulario de reasignacion.
3. Seleccionar otro agente del mismo departamento, si existe.

Resultado esperado:
- Solo aparecen agentes del mismo departamento.
- La reasignacion queda persistida.
- El historial registra `assigned_to`.

### 7. Supervisor opera globalmente

1. Iniciar sesion como supervisor.
2. Abrir `/app/supervisor/tickets`.
3. Entrar a un ticket de cualquier departamento.
4. Probar comentario interno.
5. Probar cambio de estado.
6. Probar reasignacion.

Resultado esperado:
- Supervisor puede operar tickets globalmente.
- Los cambios quedan reflejados en historial.

### 8. Comentarios internos vs publicos

1. Crear comentario interno como agente o supervisor.
2. Volver a entrar como cliente al mismo ticket.

Resultado esperado:
- El cliente no ve comentarios internos.
- Agente y supervisor si los ven.

### 9. Dashboard y visibilidad supervisor

1. Como supervisor, abrir `/app/supervisor/dashboard`.
2. Verificar conteos, tickets sin asignar y tickets abiertos.

Resultado esperado:
- El dashboard refleja datos reales de PocketBase.

## Criterio practico de cierre de Fase 1

La fase puede considerarse cerrada si estos flujos funcionan en interfaz:
- login por rol
- crear ticket
- ver tickets del cliente
- ver detalle
- comentar
- tomar ticket
- cambiar estado
- reasignar ticket
- ver historial
- ver dashboard de supervisor
